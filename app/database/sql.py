from sqlalchemy.sql import text
import time

def check_token(connection, token):
    statement = text("SELECT username, timestamp FROM login_tokens WHERE token=:token")
    username, timestamp = connection.execute(statement, {'token':token})
    if time.time() - timestamp >= 3600:
        return None
    update = text("UPDATE login_tokens SET timestamp=:now WHERE username=:username")
    connection.execute(update, {'now':int(time.time()), 'username':username})
    return username

def is_admin(connection, username):
    statement = text("SELECT Admin FROM Users WHERE Username=:username")
    return connection.execute(statement, {'username':username})