from sqlalchemy.sql import text
from uuid import uuid4
from sqlalchemy.exc import OperationalError
import time
import hashlib
from pathlib import Path
import time

def create_tables(connection):
    sql_dir = Path(__file__).parent.joinpath("sql")
    with open(sql_dir.joinpath("schema.sql")) as f:
        for statement in f.read().split(";"):
            connection.execute(text(statement))

def clear_tables(connection):
    sql_dir = Path(__file__).parent.joinpath("sql")
    with open(sql_dir.joinpath("clear_tables.sql")) as f:
        for statement in f.read().split(";"):
            try:
                connection.execute(text(statement))
            except OperationalError as e:
                if "no such table" not in str(e).lower():
                    raise

def check_token(connection, token):
    statement = text("SELECT username, timestamp FROM Tokens WHERE token=:token")
    result = connection.execute(statement, {'token':token}).fetchall()
    if not result:
        return None
    username, timestamp = result[0]
    if time.time() - timestamp >= 3600:
        return None
    update = text("UPDATE Tokens SET timestamp=:now WHERE username=:username")
    connection.execute(update, {'now':int(time.time()), 'username':username})
    return username

def is_admin(connection, username):
    statement = text("SELECT Admin FROM User WHERE Username=:username")
    result = connection.execute(statement, {'username':username}).fetchall()
    if not result:
        return False
    return result[0]

def password_check(connection, username, password):
    fetch_pws = text("SELECT Password_Hash, Salt FROM User WHERE Username=:username")
    result = connection.execute(fetch_pws, {'username':username}).fetchall()
    if not result:
        return False
    pwh, salt = result[0]
    print(pwh, salt)
    sha = hashlib.sha256()
    sha.update(f"{password}{salt}".encode())
    digest = sha.hexdigest()
    print(digest)
    return digest == pwh

def add_token_for_user(connection, username, token):
    statement = text("DELETE FROM Token WHERE Username = :user")
    connection.execute(statement, {"user": username})
    statement = text("INSERT INTO Token VALUES (:user, :token, :now)")
    connection.execute(statement, {
        "user": username,
        "token": token,
        "now": int(time.time())
    })

def create_user(connection, username, password):
    '''
    Creates a new user with username and password.
    Returns true if creation was successful and false otherwise.
    '''
    # Check if username exists already
    fetch_pws = text("SELECT Username FROM Users WHERE Username=:username")
    result = connection.execute(fetch_pws, {'username':username})
    if result:
        return False
    # Create user
    salt = uuid4().hex  # Generate salt from UUID
    pwh = hashlib.sha256(password+salt).hexdigest()
    insert = text("INSERT INTO Users VALUES (:username, :password_hash, FALSE)")
    connection.execute(insert, {'username':username, 'password_hash':pwh})
    return True
