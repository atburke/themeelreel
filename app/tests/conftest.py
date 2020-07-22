import sys
from pathlib import Path

app_root = str(Path(__file__).parents[1])
print(app_root)
if app_root not in sys.path:
    sys.path.append(app_root)

import pytest
from main import app
import sqlalchemy

from sqlalchemy.sql import text

import base64
import hashlib
from secrets import token_hex

import sql
from main import *
from util import *

TEST_DATABASE = "sqlite:///test.sqlite"


def create_user(db, user, pw, admin=False):
    salt = "saltyboi"
    pw_hash = hash_password(pw, salt)
    statement = text("INSERT INTO User VALUES (:user, :pw_hash, :salt, :admin)")
    db.execute(statement, {
        "user": user,
        "pw_hash": pw_hash,
        "salt": salt,
        "admin": admin
    })


def basic_auth_string(user, pw):
    return base64.b64encode(f"{user}:{pw}".encode()).decode()


@pytest.fixture
def db():
    engine = sqlalchemy.create_engine(TEST_DATABASE)
    with engine.connect() as conn:
        yield conn


@pytest.fixture
def client(db):
    app.config["DB_URL"] = TEST_DATABASE
    app.config["TESTING"] = True

    try:
        sql.create_tables(db)
    except Exception:
        pass

    sql.clear_tables(db)
    with app.test_client() as client:
        yield client
