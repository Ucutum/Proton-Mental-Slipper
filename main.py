from flask import Flask, render_template, request, url_for, g
import json
import requests
import sqlite3
import os
from graph import make_graph
from database import Database
import datetime
from time import sleep

DATABASE = os.path.join(os.path.abspath(""), "database.db")
DEBUG = True
SECRET_KEY = "fkjdaskFDKKLDlkjkfd&&&&&^#$*&)#jlksdjf"

app = Flask(__name__)
app.config.from_object(__name__)
app.config.update(dict(DATABASE=os.path.join(app.root_path, "database.sqlite")))

X_AUTH_TOKEN = "8HxIhi"


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


def get_db() -> Database:
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


@app.route("/start_observations")
def observations():
    db = Database(get_db())
    print("start observations")
    while True:
        now = datetime.datetime.now()
        date = f"{now.year}.{now.month}." +\
            f"{now.day}"
        time = f"{now.hour}:{now.minute}:" +\
            f"{now.second}"
        sum_temp = 0
        for source in range(1, 5):
            temp = json.loads(
                requests.get(
                    "https://dt.miet.ru/ppo_it/api/temp_hum/" + str(source),
                    headers={"X-Auth-Token": X_AUTH_TOKEN}
                    ).content
                    )["temperature"]
            print(temp, end=" ")
            sum_temp += temp
            db.add_temp("temp_" + str(source), date, time, temp)
        db.add_temp("temp_med", date, time, sum_temp / 4)
        print()
        print("observation")
        sleep(10)


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
    times = list(map(lambda x: x[2], db.get_temp(1)))
    print(data)
    datahead = ["temp" + str(i) for i in range(1, 5)]
    make_graph(data, datahead, os.path.join(app.root_path, "static", "graph.png"))
    mxl = max(map(len, data))
    for i in range(len(data)):
        while len(data[i]) < mxl:
            data[i].append("-")
    data.insert(0, times)
    datahead = ["time"] + datahead
    tabledata = list(zip(*data))

    sensors = [1, 2, 3, 4]
    return render_template(
        "temp.html", title="Temp", data=tabledata, datahead=datahead,
        temp_sensors=sensors)




@app.route("/")
@app.route("/greenhouse")
def greenhouse():
    return render_template(
        "greenhouse.html", title="Greenhouse")


@app.route("/test")
def test():
    return render_template(
        "test.html", title="Test")


@app.route("/api/temp/<name>")
def api_temp(name):
    temp = json.loads(
        requests.get(
            "https://dt.miet.ru/ppo_it/api/temp_hum/" + str(name),
            headers={"X-Auth-Token": X_AUTH_TOKEN}
            ).content
            )
    return json.dumps({"temp": temp["temperature"]})


@app.route("/api/get_data/<modif>")
def api_get_data(modif):
    db = Database(get_db())
    sensors = ["temp_1", "temp_2", "temp_3", "temp_4", "temp_med"]
    data = [list(map(lambda x: x[-1], db.get_temp(i, modif))) for i in sensors]
    times = list(map(lambda x: x[2], db.get_temp(sensors[-1], modif)))
    print(data)
    return {"data": data, "times": times, "headers": sensors}


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
