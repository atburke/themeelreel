from sqlalchemy.sql import text
from uuid import uuid4
import time
import hashlib

def check_token(connection, token):
    statement = text("SELECT Username, timestamp FROM Login_Tokens WHERE token=:token")
    result = connection.execute(statement, {'token':token})
    if not result:
        return None
    username, timestamp = result[0]
    if time.time() - timestamp >= 3600:
        return None
    update = text("UPDATE Login_Tokens SET timestamp=:now WHERE Username=:username")
    connection.execute(update, {'now':int(time.time()), 'username':username})
    return username

def is_admin(connection, username):
    statement = text("SELECT Admin FROM Users WHERE Username=:username")
    result = connection.execute(statement, {'username':username})
    if not result:
        return False
    return result[0]

def password_check(connection, username, password):
    fetch_pws = text("SELECT Password_Hash, Salt FROM Users WHERE Username=:username")
    result = connection.execute(fetch_pws, {'username':username})
    if not result:
        return False
    pwh, salt = result[0]
    sha = hashlib.sha256()
    sha.update(password+salt)
    return sha.hexdigest() == pwh

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