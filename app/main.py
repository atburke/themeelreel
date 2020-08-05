from flask import (
    Flask,
    render_template,
    abort,
    redirect,
    url_for,
    send_file,
    request,
    jsonify,
    make_response,
    g,
)

from flask_weasyprint import HTML, render_pdf

from secrets import token_hex
import sqlalchemy
from sqlalchemy.pool import NullPool
import functools
import hashlib
import os
import datetime

from app.sql import *
from app.mealplan import *
from . import ureg, Q_


app = Flask(__name__)
app.config["DATABASE_URL"] = os.environ.get(
    "CLEARDB_DATABASE_URL", "sqlite:///dev.sqlite"
)


@app.teardown_appcontext
def close_db(error):
    """
    Closes the database again at the end of the request.
    """
    if hasattr(g, "connection"):
        db = g.pop('connection', None)
        if db:
            db.close()


def get_db():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, "engine"):
        g.engine = sqlalchemy.create_engine(app.config["DATABASE_URL"], poolclass=NullPool)

    if not hasattr(g, "connection"):
        g.connection = g.engine.connect()
        create_tables(g.connection)

    return g.connection


def requires_token(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        try:
            token = request.headers["Authorization"].split(" ")[1]
        except IndexError:
            abort(401)

        if not token:
            abort(401)
        db = get_db()
        user = check_token(db, token)
        g.user = user
        if not user:
            abort(401)
        result = f(*args, **kwargs)
        g.pop("user")
        return result

    return wrapper


def admin_only(f):
    @functools.wraps(f)
    @requires_token
    def wrapper():
        username = g.user
        db = get_db()
        if is_admin(db, username):
            return f()
        else:
            abort(403)

    return wrapper


# I would 100% appreciate a better solution for this
served_files = frozenset(
    (
        "asset-manifest.json",
        "index.html",
        "favicon.ico",
        "manifest.json",
        "robots.txt",
        "service-worker.js",
    )
)

served_binary_files = frozenset(("logo192.png", "logo512.png",))


@app.route("/<file>")
def serve_root_file(file):
    if file in served_files or file in served_binary_files:
        return send_file(f"templates/{file}")

    abort(404)


@app.errorhandler(404)
def not_found(e):
    return redirect(url_for("index"))


@app.route("/")
def index():
    return render_template("index.html")


# GET /api/login
# Logs the user in. Expects the header "Authorization": "Basic <x>", where x is username:password base64-encoded (basic auth). If the login succeeds, return 200 with body {"token": <token>}, where token is a newly generated token. Otherwise, return 400.


@app.route("/api/login")
def login():
    username = request.authorization.username
    password = request.authorization.password
    db = get_db()
    if password_check(db, username, password):
        token = token_hex(32)
        add_token_for_user(db, username, token)
        return (jsonify({"token": token}), 200)
    else:
        return (jsonify({"error": "Incorrect username and password combination"}), 401)


# GET /api/createaccount
# Creates an account. Identical to /api/login except the account needs to not exist initially.


@app.route("/api/createaccount")
def createaccount():
    username = request.authorization.username
    password = request.authorization.password

    if not username:
        return (jsonify({"error": "No username given"}), 400)

    if not password:
        return (jsonify({"error": "No password given"}), 400)

    db = get_db()
    if not create_user(db, username, password):
        return (jsonify({"error": "User already exists"}), 409)

    token = token_hex(32)
    add_token_for_user(db, username, token)
    return (jsonify({"token": token}), 200)


# GET /api/adminpricelistings


@app.route("/api/adminpricelistings")
@admin_only
def admin_list():
    db = get_db()
    ingredient_kw = request.args.get("ingredient", "")
    source_kw = request.args.get("source", "")
    return (
        jsonify({"results": fetch_all_price_listings(db, ingredient_kw, source_kw)}),
        200,
    )


# POST /api/adminpricelistings/update


@app.route("/api/adminpricelistings/update", methods=["POST"])
@admin_only
def update_price():
    db = get_db()
    data = request.get_json()
    update_price_listing(
        db,
        data["ingredientName"],
        data["source"],
        data["timeCreated"],
        data.get("price"),
        data.get("units"),
    )
    update_price_average(db, data["ingredientName"])
    return (jsonify({}), 200)


# POST /api/adminpricelistings/delete


@app.route("/api/adminpricelistings/delete", methods=["POST"])
@admin_only
def delete_price():
    db = get_db()
    data = request.get_json()
    delete_price_listing(
        db, data["ingredientName"], data["source"], data["timeCreated"],
    )
    update_price_average(db, data["ingredientName"])
    return (jsonify({}), 200)


# [GET, POST] /api/pricelistings


@app.route("/api/pricelistings", methods=["GET", "POST"])
@requires_token
def access_list():
    db = get_db()
    if request.method == "GET":
        return (
            jsonify({"result": fetch_missing_price_listings(db)["ingredientName"]}),
            200,
        )
    elif request.method == "POST":
        data = request.get_json()
        # Check that primary keys are in request
        if not all(i in data.keys() for i in ["ingredientName", "source"]):
            return (jsonify({"error": "Bad request"}), 400)
        # Request checks out, ok to execute
        add_price_listing(
            db,
            data["ingredientName"],
            data["source"],
            datetime.datetime.now(),
            price=float(data["price"]),
            amount=float(data.get("amount", 1)),
            units=data.get("units"),
        )
        update_price_average(db, data["ingredientName"])
        return (jsonify({"results": "Item added."}), 200)


# GET /api/search/ingredient?kw=<keyword>


@app.route("/api/search/ingredient")
@requires_token
def search_ingr():
    db = get_db()
    kw = request.args.get("kw")
    return (jsonify({"results": get_ingredients(db, kw)}), 200)


# GET /api/search/unit?kw=<keyword>


@app.route("/api/search/unit")
@requires_token
def search_unit():
    db = get_db()
    kw = request.args.get("kw")
    return (jsonify({"results": get_units(db, kw)}), 200)


@app.route("/api/mealplan")
@requires_token
def get_meal_plans():
    db = get_db()
    return jsonify({"results": fetch_meal_plans_for_user(db, g.user)})


@app.route("/api/mealplan", methods=["POST"])
@requires_token
def generate_meal_plan():
    db = get_db()
    data = request.get_json()
    print(data)
    budget = float(data["budget"])
    total_calories = int(data["days"]) * int(data["dailyCalories"])
    min_ingredients = {}
    for ing in data["minIngredients"]:
        try:
            min_ingredients[ing["name"]] = Q_(float(ing["amount"]), ing["units"])
        except:     # bare excepts are bad but the right exception is hard to import
            min_ingredients[ing["name"]] = Q_(float(ing["amount"]), "lb")

    max_ingredients = {}
    for ing in data["maxIngredients"]:
        try:
            max_ingredients[ing["name"]] = Q_(float(ing["amount"]), ing["units"])
        except:     # bare excepts are bad but the right exception is hard to import
            max_ingredients[ing["name"]] = Q_(float(ing["amount"]), "lb")

    for quantity in min_ingredients.values():
        if quantity.magnitude < 0:
            abort(400)

    for quantity in max_ingredients.values():
        if quantity.magnitude < 0:
            abort(400)

    meals = None
    while True:
        try:
            meals = find_meals(
                db, budget, total_calories, min_ingredients, max_ingredients
            )
        except (ValueError, RuntimeError) as e:
            print(e)
            return (jsonify({"error": str(e)}), 400)

        try:
            check_plan(
                db, meals, budget, total_calories, min_ingredients, max_ingredients
            )
            break
        except AssertionError:
            pass

    meal_plan = distribute_meals(meals, int(data["days"]))
    add_meal_plan_for_user(db, g.user, meal_plan, data.get("title"))
    return (jsonify({}), 200)


@app.route("/api/mealplan", methods=["DELETE"])
@requires_token
def delete_plan():
    db = get_db()
    data = request.get_json()
    delete_meal_plan(db, data["id"], g.user)
    return (jsonify({}), 200)


@app.route("/api/mealplan/<id>.pdf")
@requires_token
def download_meal_plan(id):
   db = get_db()
   plans = fetch_meal_plans_for_user(db, g.user)
   try:
       plan = next(p for p in plans if p["id"] == id)
   except StopIteration:
       abort(404)

   plan_html = render_template("mealplan.html", **plan)
   return render_pdf(HTML(string=plan_html))
