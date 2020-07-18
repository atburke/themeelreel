from flask import Flask, render_template, abort, redirect, url_for, send_file

app = Flask(__name__)

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
