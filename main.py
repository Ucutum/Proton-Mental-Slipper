from flask import Flask, render_template, request, url_for, g
import json
import requests
import sqlite3
import os

DATABASE = os.path.join(os.path.abspath(""), "database.db")
DEBUG = True
SECRET_KEY = "fkjdaskFDKKLDlkjkfd&&&&&^#$*&)#jlksdjf"

app = Flask(__name__)
app.config.from_object(__name__)
app.config.update(dict(DATABASE=os.path.join(app.root_path, "database.sqlite")))


@app.teardown_appcontext
def close_db(error):
    if hasattr(g, "link_db"):
        g.link_db.close()


@app.route("/index")
def index():
    return render_template("index.html", title="Index")


@app.route("/home")
def home():
    return render_template("home.html", title="Home")


@app.route("/about")
def about():
    return render_template("about.html", title="About")


@app.route("/contact")
def contact():
    return render_template("contact.html", title="Contact")


@app.route("/alldata")
def alldata():
    pass

@app.route("/adddata")
def adddata():
    pass


@app.route("/temp")
def temp():
    pass


@app.route("/")
@app.route("/greenhouse")
def greenhouse():
    return render_template(
        "greenhouse.html", title="Greenhouse")


@app.route("/api/temp/<name>")
def api_temp(name):
    temp = json.loads(
        requests.get("https://dt.miet.ru/ppo_it/api/temp_hum/" + name).content)
    return json.dumps({"temp": temp["temperature"]})


if __name__ == "__main__":
    app.run(debug=True)
    # create_db()
