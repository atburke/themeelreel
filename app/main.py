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

from secrets import token_hex
import sqlalchemy
import functools
import hashlib
import os
import datetime

from app.sql import *


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
        g.connection.close()


def get_db():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, "connection"):
        g.engine = sqlalchemy.create_engine(app.config["DATABASE_URL"])
        g.connection = g.engine.connect()
    return g.connection


def requires_token(f):
    @functools.wraps(f)
    def wrapper():
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
        return f()

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
    return (jsonify({"results": fetch_all_price_listings(db)}), 200)


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
    return (jsonify({}), 200)


# [GET, POST] /api/pricelistings


@app.route("/api/pricelistings", methods=["GET", "POST"])
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
        return (jsonify({"results": "Item added."}), 200)


# GET /api/search/ingredient?kw=<keyword>


@app.route("/api/search/ingredient")
def search_ingr():
    db = get_db()
    kw = request.args.get("kw")
    return (jsonify({"results": get_ingredients(db, kw)}), 200)


# GET /api/search/unit?kw=<keyword>


@app.route("/api/search/unit")
def search_unit():
    db = get_db()
    kw = request.args.get("kw")
    return (jsonify({"results": get_units(db, kw)}), 200)
