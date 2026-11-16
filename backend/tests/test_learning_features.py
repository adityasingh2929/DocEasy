import json
import time
import unittest
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.practice_service import BANK, SESSIONS, LOCK


class LearningFeatureTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        with LOCK:
            SESSIONS.clear()

    def begin(self, topic='variables'):
        response = self.client.post('/assessments', json={'topic': topic})
        self.assertEqual(response.status_code, 200)
        return response.json()

    def answers(self, session, correct_count=5):
        lookup = {item['id']: item for item in BANK[session['topic']]['questions']}
        values = []
        for index, question in enumerate(session['questions']):
            answer = lookup[question['id']]['correctAnswer']
            if index >= correct_count:
                answer = next(option for option in question['options'] if option != answer)
            values.append({'questionId': question['id'], 'answer': answer})
        return values

    def test_all_topics_have_five_reviewed_questions_without_answer_leaks(self):
        for topic in BANK:
            session = self.begin(topic)
            self.assertEqual(len(session['questions']), 5)
            self.assertEqual(len({question['id'] for question in session['questions']}), 5)
            for question in session['questions']:
                self.assertNotIn('correctAnswer', question)
                self.assertNotIn('explanation', question)
                self.assertEqual(len(question['hints']), 2)
                self.assertTrue(question['sources'])

    def test_four_correct_passes_at_eighty_percent(self):
        session = self.begin()
        result = self.client.post(f"/assessments/{session['id']}/submit", json={'answers': self.answers(session, 4)})
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json()['percentage'], 80)
        self.assertTrue(result.json()['passed'])
        self.assertEqual(sum(not row['isCorrect'] for row in result.json()['feedback']), 1)

    def test_three_correct_does_not_pass(self):
        session = self.begin()
        result = self.client.post(f"/assessments/{session['id']}/submit", json={'answers': self.answers(session, 3)})
        self.assertEqual(result.json()['score'], 3)
        self.assertFalse(result.json()['passed'])

    def test_incomplete_duplicate_and_invalid_answers_are_rejected(self):
        session = self.begin()
        answers = self.answers(session)
        url = f"/assessments/{session['id']}/submit"
        self.assertEqual(self.client.post(url, json={'answers': answers[:4]}).status_code, 422)
        self.assertEqual(self.client.post(url, json={'answers': [answers[0]] * 5}).status_code, 422)
        answers[0]['answer'] = 'not an option'
        self.assertEqual(self.client.post(url, json={'answers': answers}).status_code, 422)

    def test_repeat_submission_is_idempotent_and_cannot_change_score(self):
        session = self.begin()
        payload = {'answers': self.answers(session)}
        url = f"/assessments/{session['id']}/submit"
        first = self.client.post(url, json=payload)
        self.assertEqual(first.json(), self.client.post(url, json=payload).json())
        self.assertEqual(self.client.post(url, json={'answers': self.answers(session, 0)}).status_code, 409)

    def test_expired_or_missing_sessions_request_a_restart(self):
        session = self.begin()
        SESSIONS[session['id']]['expiresAt'] = time.time() - 1
        url = f"/assessments/{session['id']}/submit"
        self.assertEqual(self.client.post(url, json={'answers': self.answers(session)}).status_code, 410)

    def test_unknown_topics_fail_explicitly(self):
        self.assertEqual(self.client.post('/assessments', json={'topic': 'not-a-topic'}).status_code, 404)
        self.assertEqual(self.client.get('/practice/not-a-topic/challenge').status_code, 404)

    def test_reviewed_challenges_have_hints_and_official_references(self):
        for topic in BANK:
            result = self.client.get(f'/practice/{topic}/challenge').json()
            self.assertEqual(result['origin'], 'reviewed')
            self.assertEqual(len(result['hints']), 2)
            self.assertTrue(all(source['url'].startswith('https://developer.mozilla.org/') for source in result['sources']))

    @patch('app.services.doubt_service.call_groq', return_value='Think about the scope.')
    def test_tutor_hint_levels_and_server_selected_provenance(self, provider):
        for level in ['hint1', 'hint2', 'explanation']:
            result = self.client.post('/doubt', json={'topic': 'variables', 'question': 'Help me', 'mode': 'quiz',
                'helpLevel': level, 'contextChunks': [{'text': 'CLIENT_INJECTED_CONTEXT'}]})
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.json()['helpLevel'], level)
            self.assertTrue(result.json()['sources'])
            self.assertNotIn('CLIENT_INJECTED_CONTEXT', provider.call_args.args[0])
            self.assertIn('FINAL OVERRIDING INSTRUCTION', provider.call_args.args[0])

    def test_frontend_and_backend_practice_banks_match(self):
        root = Path(__file__).resolve().parents[2]
        backend_bank = json.loads((root / 'backend/data/practice_bank.json').read_text(encoding='utf-8'))
        frontend_bank = json.loads((root / 'frontend/src/data/practice-bank.json').read_text(encoding='utf-8'))
        self.assertEqual(backend_bank, frontend_bank)


if __name__ == '__main__':
    unittest.main()
