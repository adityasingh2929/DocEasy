import io
import json
import time
import unittest
import zipfile
import httpx
from groq import RateLimitError, BadRequestError, AuthenticationError
from unittest.mock import patch
from fastapi.testclient import TestClient
from pypdf import PdfWriter
from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject
from app.main import app
from app.services import document_service as service


class DocumentTests(unittest.TestCase):
    def setUp(self):
        service.SESSIONS.clear()
        self.client = TestClient(app)

    def upload(self, name='notes.txt', data=b'Closures retain access to lexical variables. A factory can create independent counters.', mime='text/plain'):
        return self.client.post('/documents/upload', files={'file': (name, data, mime)})

    def item(self, **updates):
        value = dict(question='What does a closure retain?', options=['Lexical variables','Only numbers','Only arrays','Nothing'], correctAnswer='Lexical variables', explanation='Closures retain access to lexical variables.', hints=['Consider the enclosing scope.', 'Think about the variables of the factory.'], sourceIds=['chunk-1'], rubric=[])
        return {**value, **updates}

    def test_txt_upload_status_and_delete(self):
        response = self.upload('../notes.txt')
        self.assertEqual(response.status_code, 200, response.text)
        document = response.json()
        self.assertEqual(document['fileName'], 'notes.txt')
        self.assertEqual(document['chunks'][0]['section'], 1)
        self.assertEqual(self.client.get('/documents/'+document['id']).status_code, 200)
        self.assertEqual(self.client.delete('/documents/'+document['id']).status_code, 204)
        self.assertEqual(self.client.get('/documents/'+document['id']).status_code, 410)

    def test_invalid_files(self):
        for name, data, mime, status in [('a.exe',b'data','application/octet-stream',415),('a.pdf',b'fake','application/pdf',422),('a.docx',b'fake','application/vnd.openxmlformats-officedocument.wordprocessingml.document',422),('a.txt',b'','text/plain',422),('a.txt',b'\x00\x01','text/plain',422),('a.txt',b'abc','application/pdf',415),('a.txt',b'x'*(service.MAX_FILE+1),'text/plain',413)]:
            with self.subTest(name=name, data_length=len(data)):
                self.assertEqual(self.upload(name,data,mime).status_code,status)

    def test_docx_headings(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream,'w') as z:
            z.writestr('[Content_Types].xml','<Types/>')
            z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Closures</w:t></w:r></w:p><w:p><w:r><w:t>Functions retain lexical bindings.</w:t></w:r></w:p></w:body></w:document>')
        response = self.upload('notes.docx',stream.getvalue(),service.MIME['.docx'])
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(response.json()['chunks'][0]['heading'],'Closures')
        self.assertIsNone(response.json()['chunks'][0]['page'])

    def test_pdf_page_references_and_scans(self):
        writer = PdfWriter()
        page = writer.add_blank_page(width=300,height=300)
        font = DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')})
        page[NameObject('/Resources')] = DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):font})})
        content = DecodedStreamObject(); content.set_data(b'BT /F1 12 Tf 20 200 Td (Closures retain lexical bindings.) Tj ET')
        page[NameObject('/Contents')] = writer._add_object(content)
        writer.add_blank_page(width=300,height=300)
        data=io.BytesIO(); writer.write(data)
        response=self.upload('notes.pdf',data.getvalue(),'application/pdf')
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(response.json()['chunks'][0]['page'],1)
        self.assertIn('Page 2',response.json()['warnings'][0])
        blank=PdfWriter(); blank.add_blank_page(width=300,height=300); data=io.BytesIO(); blank.write(data)
        response=self.upload('scan.pdf',data.getvalue(),'application/pdf')
        self.assertEqual(response.status_code,422)
        self.assertIn('OCR',response.text)

    def test_chunk_limits_and_expiry(self):
        document=self.upload(data=('lexical binding '*300).encode()).json()
        self.assertGreater(len(document['chunks']),1)
        self.assertTrue(all(len(c['text']) <= 1400 for c in document['chunks']))
        service.SESSIONS[document['id']]['expiresAt']=time.time()-1
        service.purge()
        self.assertNotIn(document['id'],service.SESSIONS)
        self.assertEqual(self.client.get('/documents/'+document['id']).status_code,410)

    def test_quiz_and_challenge_source_validation(self):
        document=self.upload().json(); base='/documents/'+document['id']
        with patch.object(service,'call_groq',return_value=json.dumps({'items':[self.item()]})):
            response=self.client.post(base+'/quiz',json={'count':1})
            self.assertEqual(response.status_code,200,response.text)
            self.assertEqual(response.json()['items'][0]['sources'][0]['id'],'chunk-1')
        item=self.item(options=[],rubric=['Mentions lexical bindings','Explains retained access'])
        for kind in ['scenario','comprehension','key-term']:
            with patch.object(service,'call_groq',return_value=json.dumps({'items':[item]})):
                self.assertEqual(self.client.post(base+'/challenge',json={'challengeType':kind}).status_code,200)

    def test_malformed_ai_and_unknown_sources(self):
        base='/documents/'+self.upload().json()['id']+'/quiz'
        for response in ['not json',json.dumps({'items':[]}),json.dumps({'items':[self.item(sourceIds=['fake'])]}),json.dumps({'items':[self.item(options=['a','a','b','c'])]}),json.dumps({'items':[self.item(correctAnswer='absent')]}),json.dumps({'items':[self.item(hints=[''])]})]:
            with patch.object(service,'call_groq',return_value=response):
                self.assertEqual(self.client.post(base,json={'count':1}).status_code,502)

    def test_invalid_response_retries_once_with_validation_intact(self):
        document=self.upload().json()
        with patch.object(service,'call_groq',side_effect=['not JSON', json.dumps({'items':[self.item()]})]) as provider:
            response=self.client.post('/documents/'+document['id']+'/quiz',json={'count':1})
        self.assertEqual(response.status_code,200)
        self.assertEqual(provider.call_count,2)
        self.assertEqual(response.json()['items'][0]['sources'][0]['id'],'chunk-1')

    def test_provider_failure_preserves_document(self):
        document=self.upload().json()
        with patch.object(service,'call_groq',side_effect=RuntimeError('private provider error')):
            response=self.client.post('/documents/'+document['id']+'/quiz',json={})
        self.assertEqual(response.status_code,503)
        self.assertNotIn('private provider error',response.text)
        self.assertEqual(self.client.get('/documents/'+document['id']).status_code,200)

    def test_rate_limit_preserves_retry_timing_and_document(self):
        document=self.upload().json()
        response=httpx.Response(429,headers={'retry-after':'12.2'},request=httpx.Request('POST','https://api.groq.com/'))
        failure=RateLimitError('private message',response=response,body={'error':{'code':'rate_limit_exceeded'}})
        with patch.object(service,'call_groq',side_effect=failure) as provider:
            result=self.client.post('/documents/'+document['id']+'/quiz',json={})
        self.assertEqual(result.status_code,429)
        self.assertEqual(result.headers['retry-after'],'13')
        self.assertNotIn('private message',result.text)
        self.assertEqual(provider.call_count,1)
        self.assertEqual(self.client.get('/documents/'+document['id']).status_code,200)

    def test_provider_json_rejection_retries_but_auth_does_not(self):
        document=self.upload().json(); url='/documents/'+document['id']+'/quiz'
        response=httpx.Response(400,request=httpx.Request('POST','https://api.groq.com/'))
        failure=BadRequestError('private',response=response,body={'error':{'code':'json_validate_failed'}})
        with patch.object(service,'call_groq',side_effect=[failure,json.dumps({'items':[self.item()]})]) as provider:
            result=self.client.post(url,json={'count':1})
        self.assertEqual(result.status_code,200)
        self.assertEqual(provider.call_count,2)
        response=httpx.Response(401,request=httpx.Request('POST','https://api.groq.com/'))
        failure=AuthenticationError('private',response=response,body={})
        with patch.object(service,'call_groq',side_effect=failure) as provider:
            result=self.client.post(url,json={'count':1})
        self.assertEqual(result.status_code,503)
        self.assertIn('credentials',result.text)
        self.assertEqual(provider.call_count,1)

    def test_deletion_during_generation_does_not_return_content(self):
        document=self.upload().json()
        def provider(*args,**kwargs):
            service.delete_document(document['id'])
            return json.dumps({'items':[self.item()]})
        with patch.object(service,'call_groq',side_effect=provider):
            response=self.client.post('/documents/'+document['id']+'/quiz',json={'count':1})
        self.assertEqual(response.status_code,410)

    def test_focus_and_request_validation(self):
        document=self.upload().json(); url='/documents/'+document['id']+'/quiz'
        self.assertEqual(self.client.post(url,json={'count':11}).status_code,422)
        with patch.object(service,'call_groq') as provider:
            self.assertEqual(self.client.post(url,json={'focus':'unmatchedword'}).status_code,422)
            provider.assert_not_called()

    def test_parser_timeout(self):
        import subprocess
        with patch.object(service.subprocess,'run',side_effect=subprocess.TimeoutExpired('worker',20)):
            response=self.upload()
        self.assertEqual(response.status_code,422)
        self.assertIn('20 seconds',response.text)
