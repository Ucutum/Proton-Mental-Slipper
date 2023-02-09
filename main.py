from flask import Flask, render_template, request
import json
import requests
import sqlite3
import os

DATABASE = os.path.join(os.path.abspath(""), "database.db")
DEBUG = True
SECRET_KEY = "fkjdaskFDKKLDlkjkfd&&&&&^#$*&)#jlksdjf"

app = Flask(__name__)
app.config.update(dict(DATABASE=os.path.join(app.root_path, "database.sqlite")))


def connect_db():
    con = sqlite3.connect(app.config["DATABASE"])
    con.row_factory = sqlite3.Row
    return con


def create_db():
    db = connect_db()
    with app.open_resource("database_script.sql", "r") as file:
        db.cursor().executescript(file.read())
    db.commit()
    db.close()


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
    data = [
        (35, 36, 37), (35, 37, 39),
        (40, 39, 38)
    ]
    datahead = ["temp1", "temp2", "temp3"]
    return render_template(
        "alldata.html", title="All Data", data=data, datahead=datahead)



@app.route("/")
@app.route("/greenhouse")
def greenhouse():
    print(request.headers)
    sensors = [1, 2, 3, 4]
    return render_template(
        "greenhouse.html", title="Greenhouse",
        temp_sensors=sensors)


@app.route("/api/temp/<name>")
def api_temp(name):
    temp = json.loads(
        requests.get("https://dt.miet.ru/ppo_it/api/temp_hum/" + name).content)
    return json.dumps({"temp": temp["temperature"]})


@app.route("/adddata", methods=["GET", "POST"])
def adddata():
    if request.method == "POST":
        pass
    return render_template("adddata.html", title="Add Data")


if __name__ == "__main__":
    app.run(debug=True)
    # create_db()
