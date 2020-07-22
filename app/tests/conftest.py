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
import datetime

import sql
from main import *
from util import *

TEST_DATABASE = "sqlite:///test.sqlite"


def login(client, user, password):
    r = client.get(
        "/api/login",
        headers={"Authorization": f"Basic {basic_auth_string(user, password)}"},
    )
    assert r.status_code == 200
    return r.get_json()["token"]


def create_user(db, user, pw, admin=False):
    salt = "saltyboi"
    pw_hash = hash_password(pw, salt)
    statement = text("INSERT INTO User VALUES (:user, :pw_hash, :salt, :admin)")
    db.execute(
        statement, {"user": user, "pw_hash": pw_hash, "salt": salt, "admin": admin}
    )


def create_price_listing(db, name, source, price, units):
    now = datetime.datetime.now()
    statement = text(
        "INSERT INTO Ingredient_Price_Listing VALUES (:now, :source, :name, :units, :price)"
    )
    db.execute(
        statement,
        {"now": now, "source": source, "name": name, "units": units, "price": price},
    )
    return now


def create_recipe(db, name, type, ingredients, servings=1, calories=500):
    statement = text(
        "INSERT INTO Recipe VALUES (:name, :type, 'example.com', 'example.com', 0, :servings, :calories)"
    )
    db.execute(
        statement,
        {"name": name, "type": type, "servings": servings, "calories": calories},
    )

    for ing in ingredients:
        statement = text("INSERT INTO Ingredient VALUES (:name, :units, 0.00)")
        db.execute(statement, {"name": ing["name"], "units": ing["units"]})
        statement = text(
            "INSERT INTO Requires VALUES (:name, :recipe_name, :amount, :units)"
        )
        db.execute(
            statement,
            {
                "name": ing["name"],
                "units": ing["units"],
                "recipe_name": name,
                "amount": ing["amount"],
            },
        )


def basic_auth_string(user, pw):
    return base64.b64encode(f"{user}:{pw}".encode()).decode()


@pytest.fixture
def db():
    engine = sqlalchemy.create_engine(TEST_DATABASE)
    with engine.connect() as conn:
        yield conn


@pytest.fixture
def client(db):
    app.config["DATABASE_URL"] = TEST_DATABASE
    app.config["TESTING"] = True

    try:
        sql.create_tables(db)
    except Exception:
        pass

    sql.clear_tables(db)
    with app.test_client() as client:
        yield client
