import json
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from app.main import app
from app.rag.retriever import retrieve_chunks, TOPIC_SOURCES


class RegressionTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_all_course_topics_retrieve_relevant_docs(self):
        for topic, sources in TOPIC_SOURCES.items():
            with self.subTest(topic=topic):
                chunks = retrieve_chunks(topic, topic=topic)
                self.assertTrue(chunks)
                self.assertTrue(all(chunk['topic'] in sources for chunk in chunks))
        self.assertEqual(retrieve_chunks('', topic='not-a-topic'), [])

    @patch('app.services.quiz_service.call_groq')
    def test_valid_quiz(self, provider):
        provider.return_value = json.dumps(dict(question='Which declaration is block scoped?',
            options=['let', 'var', 'goto', 'define'], correctAnswer='let', explanation='let uses block scope.'))
        response = self.client.post('/quiz', json={'topic': 'variables'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['correctAnswer'], 'let')

    @patch('app.services.quiz_service.call_groq', side_effect=RuntimeError('private provider error'))
    def test_provider_failure_is_retryable_and_private(self, provider):
        response = self.client.post('/quiz', json={'topic': 'variables'})
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('private provider error', response.text)

    @patch('app.services.quiz_service.call_groq')
    def test_invalid_quiz_answer_is_rejected(self, provider):
        provider.return_value = json.dumps(dict(question='Question', options=['a','b','c','d'],
            correctAnswer='none', explanation='Explanation'))
        self.assertEqual(self.client.post('/quiz', json={'topic': 'variables'}).status_code, 503)

    @patch('app.services.challenge_service.call_groq')
    def test_challenge_output_keeps_case_and_quotes(self, provider):
        provider.return_value = json.dumps(dict(question='What will be logged to the console?',
            code='console.log(\'Hello\');', correctAnswer='Hello', explanation='The string is logged.'))
        response = self.client.post('/challenge', json={'topic': 'variables'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['correctAnswer'], 'Hello')

    @patch('app.services.challenge_service.call_groq', side_effect=RuntimeError('offline'))
    def test_challenge_failure_does_not_substitute_unrelated_question(self, provider):
        self.assertEqual(self.client.post('/challenge', json={'topic': 'functions'}).status_code, 503)

    @patch('app.services.challenge_service.call_groq', return_value='{}')
    def test_invalid_challenge_is_retryable(self, provider):
        self.assertEqual(self.client.post('/challenge', json={'topic': 'functions'}).status_code, 503)

    @patch('app.services.doubt_service.call_groq')
    def test_tutor_gets_actual_question_context(self, provider):
        provider.return_value = 'Explanation'
        response = self.client.post('/doubt', json=dict(topic='variables', question='Why?', mode='challenge',
            currentQuestion='Predict the output', code='console.log(42)', correctAnswer='42'))
        self.assertEqual(response.status_code, 200)
        prompt = provider.call_args.args[0]
        self.assertIn('console.log(42)', prompt)
        self.assertIn('Predict the output', prompt)

    @patch('app.services.doubt_service.call_groq', side_effect=RuntimeError('offline'))
    def test_tutor_failure_is_retryable(self, provider):
        response = self.client.post('/doubt', json=dict(topic='variables', question='Why?', mode='concept'))
        self.assertEqual(response.status_code, 503)


if __name__ == '__main__':
    unittest.main()
