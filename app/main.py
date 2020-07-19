from flask import Flask, render_template, abort, redirect, url_for, send_file, request, g
from secrets import token_hex
import sqlalchemy
import functools
import hashlib


app = Flask(__name__)

@app.teardown_appcontext
def close_db(error):
    """
    Closes the database again at the end of the request.
    """
    if hasattr(g, 'connection'):
        g.connection.close()

def get_db():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'connection'):
        g.engine = sqlalchemy.create_engine('sqlite:///census.sqlite')
        g.connection = g.engine.connect()
    return g.connection


def requires_token(f):
    @functools.wraps(f)
    def wrapper():
        token = request.headers['Authorization'].split(' ')[1]
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
served_files = frozenset((
    "asset-manifest.json",
    "index.html",
    "favicon.ico",
    "manifest.json",
    "robots.txt",
    "service-worker.js",
))

served_binary_files = frozenset((
    "logo192.png",
    "logo512.png",
))

@app.route("/<file>")
def serve_root_file(file):
    if file in served_files:
        return render_template(file)

    if file in served_binary_files:
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
        return ({'token':token_hex(32)}, 200)
    else:
        abort(401)

# GET /api/createaccount
# Creates an account. Identical to /api/login except the account needs to not exist initially.

@app.route("/api/createaccount")
def createaccount():
    username = request.authorization.username
    password = request.authorization.password
    db = get_db()
    if create_user(db, username, password):
        return ({'token':token_hex(32)}, 200)
    else:
        abort(409)

# GET /api/adminpricelistings

@app.route("/api/adminpricelistings")
def admin_list():
    return

# POST /api/adminpricelistings/update

@app.route("/api/adminpricelistings/update", method='POST')
def update_price():
    return

# POST /api/adminpricelistings/delete

@app.route("/api/adminpricelistings/delete", method='POST')
def delete_price():
    return

# POST /api/pricelistings
# GET /api/pricelistings

@app.route("/api/pricelistings", methods=['GET', 'POST'])
def access_list():
    return

# GET /api/search/ingredient?kw=<keyword>

@app.route("/api/search/ingredient?kw=<keyword>")
def search_ingr():
    return

# GET /api/search/unit?kw=<keyword>

@app.route("/api/search/unit?kw=<keyword>")
def search_unit():
    return
