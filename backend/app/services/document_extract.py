"""Bounded document extraction worker. Invoked in a disposable subprocess."""
import io
import json
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

MAX_TEXT = 200_000
MAX_PAGES = 100
MAX_EXPANDED = 20 * 1024 * 1024


def extract(data, extension):
    sections, warnings = [], []
    if extension == '.pdf':
        from pypdf import PdfReader
        if not data.startswith(b'%PDF-'):
            raise ValueError('The file does not have a valid PDF signature.')
        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted:
            raise ValueError('Password-protected PDFs are not supported. Upload an unlocked copy.')
        if len(reader.pages) > MAX_PAGES:
            raise ValueError('Use a PDF with at most 100 pages.')
        total = 0
        for i, page in enumerate(reader.pages, 1):
            content = page.get_contents()
            if content and len(content.get_data()) > MAX_EXPANDED:
                raise ValueError('A PDF page is too complex to process.')
            text = page.extract_text() or ''
            total += len(text)
            if total > MAX_TEXT:
                raise ValueError('The document exceeds 200,000 extracted characters.')
            if text.strip():
                sections.append({'page': i, 'heading': f'Page {i}', 'text': text})
            else:
                warnings.append(f'Page {i} has no readable text; OCR is not available.')
    elif extension == '.docx':
        if not data.startswith(b'PK\x03\x04'):
            raise ValueError('The file does not have a valid DOCX signature.')
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            infos = archive.infolist()
            if len(infos) > 2000 or sum(i.file_size for i in infos) > MAX_EXPANDED:
                raise ValueError('The expanded DOCX exceeds processing limits.')
            if '[Content_Types].xml' not in archive.namelist() or 'word/document.xml' not in archive.namelist():
                raise ValueError('This ZIP file is not a DOCX document.')
            xml = archive.read('word/document.xml')
            if b'<!DOCTYPE' in xml.upper() or b'<!ENTITY' in xml.upper():
                raise ValueError('XML entities are not supported.')
            root = ET.fromstring(xml)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            heading, paragraphs = 'Document', []
            for p in root.findall('.//w:p', ns):
                text = ''.join(t.text or '' for t in p.findall('.//w:t', ns)).strip()
                style = p.find('./w:pPr/w:pStyle', ns)
                is_heading = style is not None and 'heading' in style.get('{'+ns['w']+'}val', '').lower()
                if is_heading and text:
                    if paragraphs:
                        sections.append({'page': None, 'heading': heading, 'text': '\n'.join(paragraphs)})
                    heading, paragraphs = text, []
                if text:
                    paragraphs.append(text)
            if paragraphs:
                sections.append({'page': None, 'heading': heading, 'text': '\n'.join(paragraphs)})
        warnings.append('DOCX references use headings/sections, not rendered page numbers. Images are not extracted.')
    else:
        text = data.decode('utf-8-sig')
        if any(ord(c) < 32 and c not in '\n\r\t\f' for c in text):
            raise ValueError('TXT files must contain readable UTF-8 text, not binary data.')
        for i, paragraph in enumerate(re.split(r'\n\s*\n', text), 1):
            if paragraph.strip():
                sections.append({'page': None, 'heading': f'Section {i}', 'text': paragraph})
    if sum(len(s['text']) for s in sections) > MAX_TEXT:
        raise ValueError('The document exceeds 200,000 extracted characters.')
    if not sections:
        raise ValueError('No readable text found. Scanned PDFs need OCR, which is not supported yet.')
    chunks = []
    for section_index, section in enumerate(sections, 1):
        text = re.sub(r'[ \t]+', ' ', section['text']).strip()
        while text:
            end = min(1400, len(text))
            if end < len(text):
                boundary = text.rfind(' ', 0, end)
                if boundary > 700:
                    end = boundary
            chunks.append(dict(id=f'chunk-{len(chunks)+1}', page=section['page'], section=section_index,
                               heading=section['heading'], text=text[:end]))
            text = text[end:].lstrip()
    if len(chunks) > 300:
        raise ValueError('The document contains too many sections; upload a smaller selection.')
    return dict(chunks=chunks, warnings=warnings, pageCount=len(reader.pages) if extension == '.pdf' else None)


if __name__ == '__main__':
    try:
        result = extract(sys.stdin.buffer.read(5 * 1024 * 1024 + 1), sys.argv[1])
        print(json.dumps(result))
    except Exception as exc:
        message = str(exc) if isinstance(exc, (ValueError, UnicodeDecodeError)) else 'Malformed document. Export a fresh PDF, DOCX or UTF-8 TXT file.'
        print(json.dumps({'error': message}))
