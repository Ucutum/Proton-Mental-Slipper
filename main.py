from flask import Flask, render_template, request, url_for, g
import json
import requests
import sqlite3
import os
from graph import make_graph
from database import Database

DATABASE = os.path.join(os.path.abspath(""), "database.db")
DEBUG = True
SECRET_KEY = "fkjdaskFDKKLDlkjkfd&&&&&^#$*&)#jlksdjf"

app = Flask(__name__)
app.config.from_object(__name__)
app.config.update(dict(DATABASE=os.path.join(app.root_path, "database.sqlite")))


def connect_db():
    con = sqlite3.connect(app.config["DATABASE"])
    # con.row_factory = sqlite3.Row
    return con


def create_db():
    db = connect_db()
    with app.open_resource("database_script.sql", "r") as file:
        db.cursor().executescript(file.read())
    db.commit()
    db.close()


def get_db():
    if not hasattr(g, "link_db"):
        g.link_db = connect_db()
    return g.link_db


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
    db = Database(get_db())
    data = [list(map(lambda x: x[-1], db.get_temp(i))) for i in range(1, 5)]
    datahead = ["temp" + str(i) for i in range(1, 5)]
    make_graph(data, datahead, os.path.join(app.root_path, "static", "graph.png"))
    mxl = max(map(len, data))
    for i in range(len(data)):
        while len(data[i]) < mxl:
            data[i].append("-")
    tabledata = list(zip(*data))
    return render_template(
        "alldata.html", title="All Data", data=tabledata, datahead=datahead)


@app.route("/temp")
def temp():
    db = Database(get_db())
    data = [list(map(lambda x: x[-1], db.get_temp(i))) for i in range(1, 5)]
    # print(first_data)
    # data = list(map(lambda x: x[-1], first_data))
    print(data)
    # times = list(map(lambda x: x[0], first_data))
    datahead = ["temp" + str(i) for i in range(1, 5)]
    make_graph(data, datahead, os.path.join(app.root_path, "static", "graph.png"))
    mxl = max(map(len, data))
    for i in range(len(data)):
        while len(data[i]) < mxl:
            data[i].append("-")
    tabledata = list(zip(*data))

    sensors = [1, 2, 3, 4]
    return render_template(
        "temp.html", title="Temp", data=tabledata, datahead=datahead,
        temp_sensors=sensors)




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
        date = request.form["date"]
        time = request.form["time"]
        source = request.form.getlist("source")[0]
        value = request.form["value"]
        db = Database(get_db())
        db.add_temp(source, date, time, value)
    return render_template("adddata.html", title="Add Data")


if __name__ == "__main__":
    app.run(debug=True)
    # create_db()
