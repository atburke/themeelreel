from sqlalchemy.sql import text
from uuid import uuid4
from sqlalchemy.exc import OperationalError
import time
import hashlib
from pathlib import Path
import time
import datetime

from app.util import hash_password

TS_FORMAT = "%Y-%m-%d %H:%M:%S"


def create_tables(connection):
    sql_dir = Path(__file__).parent.joinpath("database")
    with open(sql_dir.joinpath("schema.sql")) as f:
        for statement in f.read().split(";"):
            connection.execute(text(statement))


def clear_tables(connection):
    sql_dir = Path(__file__).parent.joinpath("database")
    with open(sql_dir.joinpath("clear_tables.sql")) as f:
        for statement in f.read().split(";"):
            try:
                connection.execute(text(statement))
            except OperationalError as e:
                if "no such table" not in str(e).lower():
                    raise


def check_token(connection, token):
    statement = text("SELECT username, TimeCreated FROM Token WHERE token=:token")
    result = connection.execute(statement, {"token": token}).fetchall()
    if not result:
        return None
    username, timestamp = result[0]
    now = datetime.datetime.now()
    if now - datetime.datetime.strptime(timestamp.split(".")[0], TS_FORMAT) >= datetime.timedelta(seconds=3600):
        return None

    update = text("UPDATE Token SET TimeCreated=:now WHERE username=:username")
    connection.execute(update, {"now": now, "username": username})
    return username


def is_admin(connection, username):
    statement = text("SELECT Is_Admin FROM User WHERE Username=:username")
    result = connection.execute(statement, {"username": username}).fetchall()
    if not result:
        return False
    return result[0].Is_Admin


def password_check(connection, username, password):
    fetch_pws = text("SELECT Password_Hash, Salt FROM User WHERE Username=:username")
    result = connection.execute(fetch_pws, {"username": username}).fetchall()
    if not result:
        return False

    pwh, salt = result[0]
    digest = hash_password(password, salt)
    return digest == pwh


def add_token_for_user(connection, username, token):
    now = datetime.datetime.now()
    statement = text("DELETE FROM Token WHERE Username = :user")
    connection.execute(statement, {"user": username})
    statement = text("INSERT INTO Token VALUES (:user, :token, :now)")
    connection.execute(
        statement, {"user": username, "token": token, "now": now}
    )


def create_user(connection, username, password):
    """
    Creates a new user with username and password.
    Returns true if creation was successful and false otherwise.
    """
    # Check if username exists already
    fetch_pws = text("SELECT Username FROM User WHERE Username=:username")
    result = connection.execute(fetch_pws, {"username": username}).fetchall()
    if result:
        return False

    # Create user
    salt = uuid4().hex  # Generate salt from UUID
    pwh = hash_password(password, salt)
    insert = text("INSERT INTO User VALUES (:username, :password_hash, :salt, FALSE)")
    connection.execute(
        insert, {"username": username, "password_hash": pwh, "salt": salt}
    )
    return True


def fetch_all_price_listings(db):
    statement = text(
        "SELECT * FROM Ingredient_Price_Listing ORDER BY Ingredient_Name, Ingredient_Source, Ingredient_Units, Ingredient_Price, Time_Added"
    )
    return [
        {
            "ingredientName": r.Ingredient_Name,
            "source": r.Ingredient_Source,
            "timeCreated": r.Time_Added,
            "units": r.Ingredient_Units,
            "price": r.Ingredient_Price,
        }
        for r in db.execute(statement)
    ]


def fetch_missing_price_listings(db):
    statement = text(
        """
        SELECT A.Ingredient_Name
        FROM Ingredient A LEFT OUTER JOIN Ingredient_Price_Listing B ON (A.Ingredient_Name = B.Ingredient_Name)
        WHERE B.Ingredient_Price IS NULL
        LIMIT 1
        """
    )
    result = [r.Ingredient_Name for r in db.execute(statement)]
    if result:
        return {'ingredientName': result[0]}
    return fetch_minimal_price_listings(db)


def fetch_minimal_price_listings(db):
    statement = text(
        """
        SELECT A.Ingredient_Name, COUNT(A.Ingredient_Name) C
        FROM Ingredient A LEFT OUTER JOIN Ingredient_Price_Listing B ON (A.Ingredient_Name = B.Ingredient_Name)
        WHERE B.Ingredient_Price IS NOT NULL
        GROUP BY A.Ingredient_Name
        ORDER BY C ASC
        LIMIT 1
        """
    )
    result = [r for r in db.execute(statement)]
    if result:
        return {'ingredientName':result[0].Ingredient_Name}
    return {'ingredientName':''}


def add_price_listing(db, name, source, time_created, price=None, amount=None, units=None):
    if price and amount:
        price = price / amount

    statement = text(
        "INSERT INTO Ingredient_Price_Listing VALUES (:time_created, :source, :name, :units, :price)"
    )
    db.execute(
        statement,
        {
            "price": price,
            "units": units,
            "time_created": time_created,
            "source": source,
            "name": name,
        },
    )


def update_price_listing(db, name, source, time_created, price=None, units=None):
    if price is None and units is None:
        return

    updates = []
    if price is not None:
        updates.append("Ingredient_Price = :price")
    if units is not None:
        updates.append("Ingredient_Units = :units")

    statement = text(
        f"UPDATE Ingredient_Price_Listing SET {', '.join(updates)} WHERE Time_Added = :time_created AND Ingredient_Source = :source AND Ingredient_Name = :name"
    )
    db.execute(
        statement,
        {
            "price": price,
            "units": units,
            "time_created": time_created,
            "source": source,
            "name": name,
        },
    )


def delete_price_listing(db, name, source, time_created):
    statement = text(
        "DELETE FROM Ingredient_Price_Listing WHERE Time_Added = :time_created AND Ingredient_Source = :source AND Ingredient_Name = :name"
    )
    db.execute(
        statement, {"name": name, "source": source, "time_created": time_created}
    )


def get_ingredients(db, kw):
    statement = text(
        "SELECT DISTINCT Ingredient_Name FROM Ingredient WHERE Ingredient_Name LIKE :kw ORDER BY Ingredient_Name"
    )
    result = db.execute(
        statement, {"kw": f"%{kw.strip()}%"}
    )
    return [r.Ingredient_Name for r in result]


def get_units(db, kw):
    statement = text(
        "SELECT DISTINCT Recipe_Units FROM Ingredient WHERE Recipe_Units LIKE :kw ORDER BY Recipe_Units"
    )
    result = db.execute(
        statement, {"kw": f"%{kw.strip()}%"}
    )
    return [r.Recipe_Units for r in result]