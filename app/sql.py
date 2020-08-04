from sqlalchemy.sql import text
from uuid import uuid4
from sqlalchemy.exc import OperationalError
import time
import hashlib
from pathlib import Path
import time
import datetime
import itertools
from collections import defaultdict

from app.util import hash_password, average_price
from . import ureg, Q_

TS_FORMAT = "%Y-%m-%d %H:%M:%S.%f"


def create_tables(connection):
    sql_dir = Path(__file__).parent.joinpath("database")
    with open(sql_dir.joinpath("schema.sql")) as f:
        for statement in f.read().split(";"):
            try:
                connection.execute(text(statement))
            except OperationalError as e:
                print(e)
    # Create triggers
    # trigger_update_avg(connection)


def clear_tables(connection):
    sql_dir = Path(__file__).parent.joinpath("database")
    with open(sql_dir.joinpath("clear_tables.sql")) as f:
        for statement in f.read().split(";"):
            try:
                connection.execute(text(statement))
            except OperationalError as e:
                if "no such table" not in str(e).lower():
                    raise


# def trigger_update_avg(connection):
#     statement = text(
#         """
#         CREATE TRIGGER UpdateAvg
#             AFTER INSERT ON Ingredient_Price_Listing
#             FOR EACH ROW
#             BEGIN
#                 UPDATE Ingredient
#                 SET Average_Price_Per_Unit=:avg, Recipe_Units=:units
#                 WHERE Ingredient_Name = NEW.Ingredient_Name;
#             END;
#         """
#         )
#     update = average_price(
#         [i for i in db.execute(text(
#             """
#             SELECT Ingredient_Price, Ingredient_Units
#             FROM Ingredient_Price_Listing
#             """
#         ))]
#     )
#     connection.execute(statement, {'avg':update[0], 'units':update[1]})


def check_token(connection, token):
    statement = text("SELECT username, TimeCreated FROM Token WHERE token=:token")
    result = connection.execute(statement, {"token": token}).fetchall()
    if not result:
        return None
    username, timestamp = result[0]
    now = datetime.datetime.now()
    if isinstance(timestamp, str):
        timestamp = datetime.datetime.strptime(timestamp, TS_FORMAT)

    if now - timestamp >= datetime.timedelta(seconds=3600):
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
    connection.execute(statement, {"user": username, "token": token, "now": now})


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
    insert = text(
        "INSERT INTO User VALUES (:username, :password_hash, :salt, TRUE)"
    )  # TEMPORARY
    connection.execute(
        insert, {"username": username, "password_hash": pwh, "salt": salt}
    )
    return True


def fetch_all_price_listings(db, ingredient_kw="", source_kw=""):
    statement = text(
        "SELECT * FROM Ingredient_Price_Listing "
        "WHERE Ingredient_Name LIKE :ing AND Ingredient_Source LIKE :source "
        "ORDER BY Ingredient_Name, Ingredient_Source, Ingredient_Units, Ingredient_Price, Time_Added"
    )
    return [
        {
            "ingredientName": r.Ingredient_Name,
            "source": r.Ingredient_Source,
            "timeCreated": str(r.Time_Added),
            "units": r.Ingredient_Units,
            "price": r.Ingredient_Price,
        }
        for r in db.execute(
            statement, {"ing": f"%{ingredient_kw}%", "source": f"%{source_kw}%"}
        )
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
        return {"ingredientName": result[0]}
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
        return {"ingredientName": result[0].Ingredient_Name}
    return {"ingredientName": ""}


def add_price_listing(
    db, name, source, time_created, price=None, amount=None, units=None
):
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

    update_price_average(db, name)


def update_price_average(db, name):
    update = average_price(
        [
            i
            for i in db.execute(
                text(
                    """
            SELECT Ingredient_Price, Ingredient_Units
            FROM Ingredient_Price_Listing
            WHERE Ingredient_Name=:name
            """
                ),
                {"name": name},
            )
        ]
    )
    db.execute(
        text(
            """
        UPDATE Ingredient
        SET Average_Price_Per_Unit=:avg, Recipe_Units=:units
        WHERE Ingredient_Name=:name;
        """
        ),
        {"avg": update[0], "units": update[1], "name": name},
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
    result = db.execute(statement, {"kw": f"%{kw.strip()}%"})
    return [r.Ingredient_Name for r in result]


def get_units(db, kw):
    statement = text(
        "SELECT DISTINCT Recipe_Units FROM Ingredient WHERE Recipe_Units LIKE :kw ORDER BY Recipe_Units"
    )
    result = db.execute(statement, {"kw": f"%{kw.strip()}%"})
    return [r.Recipe_Units for r in result]


def fetch_recipes(db, excludes=None):
    excludes = excludes or []
    constraint_str = (
        "WHERE name NOT IN (SELECT Recipe_Name FROM Recipe NATURAL JOIN Requires WHERE Ingredient_Name IN :excludes) "
        if excludes
        else ""
    )

    statement = text(
        "SELECT Recipe_Name AS name, Recipe_Cost AS cost, Calories AS calories, Recipe_Cost / Calories AS costPerCalorie "
        + "FROM Recipe "
        + constraint_str
        + "ORDER BY costPerCalorie"
    )
    return db.execute(statement, {"excludes": tuple(excludes)}).fetchall()


def fetch_ingredients_for_recipes(db, includes=None, excludes=None):
    constraints = []
    includes = includes or []
    excludes = excludes or []
    if excludes:
        if len(excludes) > 1:
            constraints.append("ingredientName NOT IN :excludes")
        else:
            constraints.append("ingredientName <> :firstExcludes")

    if includes:
        if len(includes) > 1:
            constraints.append("ingredientName IN :includes")
        else:
            constraints.append("ingredientName = :firstIncludes")

    constraint_str = f"WHERE {' AND '.join(constraints)} " if constraints else ""

    statement = text(
        "SELECT Req.Recipe_Name AS name, Req.Ingredient_Name AS ingredientName, Req.Required_Amount AS amount, Req.Item_Units as units "
        + "FROM Recipe Rec JOIN Requires Req ON Rec.Recipe_Name = Req.Recipe_Name "
        + constraint_str
        + "ORDER BY name"
    )
    results = db.execute(
        statement,
        {
            "includeAll": not includes,
            "includes": tuple(includes),
            "excludes": tuple(excludes),
            "firstIncludes": includes[0] if includes else None,
            "firstExcludes": excludes[0] if excludes else None,
        },
    )
    ingredient_map = defaultdict(dict)
    for recipe_name, ingredients in itertools.groupby(results, key=lambda x: x.name):
        for ing in ingredients:
            ingredient_map[recipe_name][ing.ingredientName] = Q_(ing.amount, ing.units)

    return ingredient_map


def fetch_recipe_by_name(db, name):
    statement = text(
        "SELECT Recipe_Name AS name, Recipe_Cost AS cost, Calories AS calories "
        "FROM Recipe "
        "WHERE name = :name"
    )
    result = db.execute(statement, {"name": name}).fetchall()
    return result[0]


def add_meal_plan_for_user(db, username, plan, title=None):
    # this scheme to find the next id would have concurrency issues, but this
    # app is not concurrent and it's the only thing that will be accessing
    # the db, so we should be good
    statement = text(
        "SELECT MIN(Meal_Plan_ID) AS minID, MAX(Meal_Plan_ID) AS maxID "
        "FROM Meal_Plan"
    )
    min_id, max_id = db.execute(statment).fetchall()[0]
    plan_id = min_id - 1 if min_id > 1 else max_id + 1
    now = datetime.datetime.now()
    if not title:
        title = f"Meal Plan {now}"

    statement = text("INSERT INTO Meal_Plan " "VALUES (:id, :user, :title, :now)")
    db.execute(statement, {"id": plan_id, "user": username, "title": title, "now": now})

    for i, day_plan in enumerate(plan, start=1):
        for j, recipe in enumerate(day_plan, start=1):
            statement = text(
                "INSERT INTO Consists_Of " "VALUES (:name, :id, :day, :order)"
            )
            db.execute(
                statment, {"name": recipe.name, "id": plan_id, "day": i, "order": j}
            )


def fetch_meal_plans_for_user(db, username):
    statement = text(
        "SELECT Meal_Plan_ID AS id, Meal_Plan_Title AS title, Time_Created AS timeCreated "
        "FROM Meal_Plan "
        "WHERE Username = :user "
        "ORDER BY timeCreated DESC"
    )
    plans = db.execute(statement, {"user": username}).fetchall()
    results = []
    for plan in plans:
        new_plan = {"id": plan.id, "name": plan.title, "timeCreated": plan.timeCreated}
        statement = text(
            "SELECT R.Recipe_Name AS name, Image_URL AS imageURL, Recipe_URL AS recipeURL, Recipe_Cost AS cost, Calories as calories, Day AS day, Order AS order "
            "FROM Recipe R JOIN Consists_Of C ON R.Recipe_Name = C.Recipe_Name "
            "WHERE Meal_Plan_ID = :id "
            "ORDER BY day, order"
        )
        recipes = db.execute(statement, {"id": plan.id}).fetchall()
        new_plan["recipes"] = [[] for _ in range(max(r.day for r in recipes))]
        for recipe in recipes:
            recipe_listing = {
                "name": recipe.name,
                "imageURL": recipe.imageURL,
                "recipeURL": recipe.recipeURL,
                "cost": recipe.cost,
                "calories": recipe.calories,
            }
            new_plan["recipes"][recipe.day - 1].append(recipe_listing)

        new_plan["totalCost"] = sum(
            r.cost for r in itertools.chain.from_iterable(new_plan["recipes"])
        )
        new_plan["totalCalories"] = sum(
            r.calories for r in itertools.chain.from_iterable(new_plan["recipes"])
        )
        results.append(new_plan)

    return results


def delete_meal_plan(db, id, username):
    statement = text(
        "DELETE FROM Meal_Plan " "WHERE Meal_Plan_ID = :id AND Username = :user"
    )
    db.execute(statement, {"id": id, "user": username})
