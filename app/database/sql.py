from sqlalchemy.sql import text
import time
import hashlib

def check_token(connection, token):
    statement = text("SELECT username, timestamp FROM login_tokens WHERE token=:token")
    result = connection.execute(statement, {'token':token})
    if not result:
        return None
    username, timestamp = result[0]
    if time.time() - timestamp >= 3600:
        return None
    update = text("UPDATE login_tokens SET timestamp=:now WHERE username=:username")
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
    sha.update(username+salt)
    return sha.hexdigest() == pwh