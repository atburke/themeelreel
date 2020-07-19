from conftest import *

def test_login(client, db):
    create_user(db, "me123", "mypassword")
    r = client.get("/api/login", headers={
        "Authorization": f"Basic {basic_auth_string('me123', 'mypassword')}"
    })
    assert r.status_code == 200
    data = r.get_json()
    assert "token" in data
    token = data["token"]

    statement = text("SELECT token FROM Token WHERE Username = :user")
    results = db.execute(statement, {"user": "me123"}).fetchall()
    assert results != []

    db_token = results[0]
    assert token == db_token[0]


def test_login_not_found(client, db):
    r = client.get("/api/login", headers={
        "Authorization": f"Basic {basic_auth_string('me123', 'mypassword')}"
    })
    assert r.status_code == 401


def test_login_bad_password(client, db):
    create_user(db, "me123", "mypassword")
    r = client.get("/api/login", headers={
        "Authorization": f"Basic {basic_auth_string('me123', 'wrongpassword')}"
    })
    assert r.status_code == 401
