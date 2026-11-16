"""Deterministic exercises and bounded, temporary assessment sessions."""
import copy
import json
import random
import secrets
import threading
import time
from pathlib import Path
from fastapi import HTTPException

BANK_PATH = Path(__file__).resolve().parents[2] / 'data' / 'practice_bank.json'
BANK = json.loads(BANK_PATH.read_text(encoding='utf-8'))['topics']
PASS_PERCENT = 80
SESSION_TTL = 3600
MAX_SESSIONS = 256
SESSIONS = {}
LOCK = threading.Lock()


def topic_bank(topic):
    if topic not in BANK:
        raise HTTPException(404, 'Unknown lesson topic.')
    return BANK[topic]


def references(topic):
    return copy.deepcopy(topic_bank(topic)['sources'])


def create_assessment(topic):
    questions = copy.deepcopy(topic_bank(topic)['questions'])
    random.SystemRandom().shuffle(questions)
    for question in questions:
        random.SystemRandom().shuffle(question['options'])
    session_id = secrets.token_urlsafe(24)
    now = time.time()
    with LOCK:
        for key in list(SESSIONS):
            if SESSIONS[key]['expiresAt'] <= now:
                del SESSIONS[key]
        if len(SESSIONS) >= MAX_SESSIONS:
            raise HTTPException(503, 'Too many active assessments. Please try later.')
        SESSIONS[session_id] = dict(topic=topic, questions=questions, expiresAt=now + SESSION_TTL, result=None, answers=None)
    public_questions = [{key: value for key, value in q.items() if key not in ('correctAnswer', 'explanation')} for q in questions]
    return dict(id=session_id, topic=topic, questions=public_questions, passPercent=PASS_PERCENT,
                expiresAt=now + SESSION_TTL, origin='reviewed', grading='server')


def submit_assessment(session_id, answers):
    with LOCK:
        session = SESSIONS.get(session_id)
        if session is None or session['expiresAt'] <= time.time():
            SESSIONS.pop(session_id, None)
            raise HTTPException(410, 'This assessment expired or the backend restarted. Start a new assessment.')
        expected = {question['id'] for question in session['questions']}
        answer_map = {answer.questionId: answer.answer for answer in answers}
        if len(answer_map) != len(answers) or set(answer_map) != expected:
            raise HTTPException(422, 'Answer every question exactly once.')
        if session['result'] is not None:
            if answer_map != session['answers']:
                raise HTTPException(409, 'This assessment has already been submitted.')
            return copy.deepcopy(session['result'])
        for question in session['questions']:
            if answer_map[question['id']] not in question['options']:
                raise HTTPException(422, 'An answer does not match the available options.')
        feedback = [{**question, 'userAnswer': answer_map[question['id']],
                     'isCorrect': answer_map[question['id']] == question['correctAnswer']} for question in session['questions']]
        score = sum(item['isCorrect'] for item in feedback)
        percentage = round(100 * score / len(feedback))
        result = dict(id=session_id, topic=session['topic'], score=score, total=len(feedback),
                      percentage=percentage, passed=percentage >= PASS_PERCENT, passPercent=PASS_PERCENT,
                      feedback=feedback, origin='reviewed', grading='server')
        session['result'], session['answers'] = result, answer_map
        return copy.deepcopy(result)


def reviewed_challenge(topic):
    return copy.deepcopy(random.SystemRandom().choice(topic_bank(topic)['challenges']))
