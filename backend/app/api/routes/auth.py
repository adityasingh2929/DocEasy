"""Persistent accounts and revocable sessions: hosted Postgres or local SQLite."""
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from pathlib import Path
from contextlib import contextmanager
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix='/auth', tags=['Accounts'])

SCHEMA = '''
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, salt TEXT NOT NULL, password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS progress (user_id TEXT PRIMARY KEY REFERENCES users(id), data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (email TEXT PRIMARY KEY, count INTEGER NOT NULL, started DOUBLE PRECISION NOT NULL);
'''

class PostgresConnection:
    def __init__(self, connection):
        self.connection = connection
    def execute(self, sql, parameters=()):
        return self.connection.execute(sql.replace('?', '%s'), parameters)
    def commit(self):
        self.connection.commit()

@contextmanager
def database():
    url = os.getenv('DATABASE_URL')
    if url:
        import psycopg
        from psycopg.rows import dict_row
        with psycopg.connect(url, row_factory=dict_row, connect_timeout=10) as connection:
            for statement in SCHEMA.split(';'):
                if statement.strip():
                    connection.execute(statement)
            yield PostgresConnection(connection)
        return
    if os.getenv('RENDER'):
        raise HTTPException(503, 'Account storage is not configured. Set DATABASE_URL before using accounts.')
    path = Path(os.getenv('DOCEASY_DB', 'data/accounts.sqlite3'))
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path, timeout=15)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    db.executescript(SCHEMA)
    try:
        with db:
            yield db
    finally:
        db.close()

def digest(password, salt):
    return hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()

def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()

def current_user(authorization: str = Header(default='')):
    if not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Please sign in to continue.')
    with database() as db:
        user = db.execute('SELECT u.id,u.email,u.name FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token=? AND s.expires>?', (token_hash(authorization[7:]), time.time())).fetchone()
    if not user:
        raise HTTPException(401, 'Your session expired. Please sign in again.')
    return dict(user)

class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    name: str = Field(default='', max_length=80)

def email_address(value):
    value = value.strip().lower()
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', value):
        raise HTTPException(422, 'Enter a valid email address.')
    return value

def session(db, user):
    token = secrets.token_urlsafe(32)
    db.execute('DELETE FROM sessions WHERE expires<=?', (time.time(),))
    db.execute('INSERT INTO sessions VALUES (?,?,?)', (token_hash(token), user['id'], time.time() + 86400 * 7))
    return {'token': token, 'user': {k: user[k] for k in ('id', 'email', 'name')}}

@router.post('/register', status_code=201)
def register(body: Credentials):
    email = email_address(body.email)
    name = body.name.strip()
    if not name:
        raise HTTPException(422, 'Enter your name.')
    salt = secrets.token_hex(16)
    user = dict(id=secrets.token_hex(16), email=email, name=name)
    try:
        with database() as db:
            created = db.execute('INSERT INTO users VALUES (?,?,?,?,?) ON CONFLICT(email) DO NOTHING RETURNING id', (*user.values(), salt, digest(body.password, salt))).fetchone()
            if not created:
                raise HTTPException(409, 'An account with that email already exists. Sign in instead.')
            return session(db, user)
    except sqlite3.IntegrityError:
        raise HTTPException(409, 'An account with that email already exists. Sign in instead.')

@router.post('/login')
def login(body: Credentials):
    email = email_address(body.email)
    with database() as db:
        db.execute('DELETE FROM attempts WHERE started<?', (time.time() - 900,))
        attempt = db.execute('SELECT count FROM attempts WHERE email=?', (email,)).fetchone()
        if attempt and attempt['count'] >= 10:
            raise HTTPException(429, 'Too many sign-in attempts. Try again in 15 minutes.')
        user = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
        valid = hmac.compare_digest(digest(body.password, user['salt'] if user else '00' * 16), user['password'] if user else '00' * 64)
        if not user or not valid:
            db.execute('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(email) DO UPDATE SET count=attempts.count+1', (email, time.time()))
            db.commit()
            raise HTTPException(401, 'Email or password is incorrect.')
        db.execute('DELETE FROM attempts WHERE email=?', (email,))
        return session(db, user)

@router.get('/me')
def me(user=Depends(current_user)):
    return user

@router.post('/logout')
def logout(authorization: str = Header(default=''), user=Depends(current_user)):
    with database() as db:
        db.execute('DELETE FROM sessions WHERE token=?', (token_hash(authorization[7:]),))
    return {'ok': True}

@router.get('/progress')
def get_progress(user=Depends(current_user)):
    with database() as db:
        row = db.execute('SELECT data FROM progress WHERE user_id=?', (user['id'],)).fetchone()
    return json.loads(row['data']) if row else {}

@router.put('/progress')
def put_progress(body: dict, user=Depends(current_user)):
    encoded = json.dumps(body)
    if len(encoded.encode()) > 2_000_000:
        raise HTTPException(413, 'Progress history is too large to sync.')
    with database() as db:
        db.execute('INSERT INTO progress VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data', (user['id'], encoded))
    return {'ok': True}
