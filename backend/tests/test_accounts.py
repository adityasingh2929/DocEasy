import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.auth import database

class AccountTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {'DOCEASY_DB': str(Path(self.tmp.name) / 'test.sqlite3')})
        self.env.start()
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()
        self.env.stop()
        self.tmp.cleanup()

    def register(self, email='ada@example.com'):
        response = self.client.post('/auth/register', json={'name':'Ada', 'email':email, 'password':'a strong password'})
        self.assertEqual(response.status_code, 201)
        return response.json()

    def test_account_is_persistent_password_hashed_and_logout_revokes_session(self):
        result = self.register()
        headers = {'Authorization': 'Bearer ' + result['token']}
        self.assertEqual(self.client.get('/auth/me', headers=headers).json()['name'], 'Ada')
        with database() as db:
            row = db.execute('SELECT password FROM users').fetchone()
            self.assertNotEqual(row['password'], 'a strong password')
            self.assertNotEqual(db.execute('SELECT token FROM sessions').fetchone()['token'], result['token'])
        other_client = TestClient(app)
        self.assertEqual(other_client.post('/auth/login', json={'email':'ADA@example.com','password':'a strong password'}).status_code, 200)
        other_client.close()
        self.assertEqual(self.client.post('/auth/logout', headers=headers).status_code, 200)
        self.assertEqual(self.client.get('/auth/me', headers=headers).status_code, 401)

    def test_users_cannot_read_or_overwrite_each_others_progress(self):
        one, two = self.register(), self.register('lin@example.com')
        a, b = ({'Authorization': 'Bearer ' + record['token']} for record in (one, two))
        self.assertEqual(self.client.put('/auth/progress', headers=a, json={'topicsCompleted':['variables']}).status_code, 200)
        self.assertEqual(self.client.get('/auth/progress', headers=b).json(), {})
        self.client.put('/auth/progress', headers=b, json={'topicsCompleted':['python-basics'], 'user_id':one['user']['id']})
        self.assertEqual(self.client.get('/auth/progress', headers=a).json()['topicsCompleted'], ['variables'])
        self.assertEqual(self.client.get('/auth/progress').status_code, 401)

    def test_invalid_duplicate_and_throttled_login(self):
        self.register()
        self.assertEqual(self.client.post('/auth/register', json={'email':'ada@example.com','name':'Ada','password':'a strong password'}).status_code, 409)
        self.assertEqual(self.client.post('/auth/register', json={'email':'bad','name':'Ada','password':'a strong password'}).status_code, 422)
        for _ in range(10):
            self.assertEqual(self.client.post('/auth/login', json={'email':'ada@example.com','password':'incorrect password'}).status_code, 401)
        self.assertEqual(self.client.post('/auth/login', json={'email':'ada@example.com','password':'incorrect password'}).status_code, 429)

class PythonCurriculumTests(unittest.TestCase):
    def test_every_python_challenge_runs_and_matches_expected_output(self):
        bank = json.loads((Path(__file__).resolve().parents[1] / 'data/practice_bank.json').read_text(encoding='utf-8'))
        topics = {key: value for key, value in bank['topics'].items() if key.startswith('python-')}
        self.assertEqual(len(topics), 11)
        for topic, group in topics.items():
            self.assertEqual(len(group['questions']), 5)
            for exercise in group['challenges']:
                # Execute only version-controlled, authored fixtures; never learner-supplied code.
                result = subprocess.run([sys.executable, '-I', '-c', exercise['code']], capture_output=True, text=True, timeout=5)
                self.assertEqual(result.returncode, 0, topic + result.stderr)
                self.assertEqual(result.stdout.strip(), exercise['correctAnswer'], topic)
