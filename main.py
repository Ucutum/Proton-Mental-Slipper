from flask import Flask, render_template, request, url_for, g, redirect
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

observating = False

SENSORS_TEMP = ["temp_1", "temp_2", "temp_3", "temp_4", "temp_med"]
SENSORS_AIR = ["air_1", "air_2", "air_3", "air_4", "air_med"]
SENSORS_SOIL = [
    "soil_1", "soil_2", "soil_3", "soil_4", "soil_5",
    "soil_6", "soil_med"]
SENSOR_TYPES = {
    "temp": SENSORS_TEMP, "air": SENSORS_AIR,
    "soil": SENSORS_SOIL}
SENSORS_API = {
    "temp": "https://dt.miet.ru/ppo_it/api/temp_hum/",
    "air": "https://dt.miet.ru/ppo_it/api/temp_hum/",
    "soil": "https://dt.miet.ru/ppo_it/api/hum/"
}


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
    global observating

    if observating:
        return redirect("home", code=302)
    else:
        observating = True

    db = Database(get_db())
    print("start observations")
    while True:
        now = datetime.datetime.now()
        date = f"{now.year}.{now.month}." +\
            f"{now.day}"
        time = f"{now.hour}:{now.minute}:" +\
            f"{now.second}"
        for datatype in ["temp", "air", "soil"]:
            print("observation", datatype, end="   ")
            sum_ = 0
            for source in range(1, len(SENSOR_TYPES[datatype])):
                d = json.loads(
                    requests.get(
                        SENSORS_API[datatype] + str(source),
                        headers={"X-Auth-Token": X_AUTH_TOKEN}
                        ).content
                        )["temperature" if (datatype == "temp") else "humidity"]
                print(d, end=" ")
                sum_ += d
                db.add(datatype, datatype + "_" + str(source), date, time, d)
            db.add(datatype,  datatype + "_med", date, time, sum_ / (len(SENSOR_TYPES[datatype]) - 1))
        print()
        sleep(10)


@app.route("/about")
def about():
    return render_template("about.html", title="About")


@app.route("/contact")
def contact():
    return render_template("contact.html", title="Contact")


@app.route("/alldata")
def alldata():
    return redirect(url_for("home"), code=302)


@app.route("/temp")
def temp():
    return redirect(url_for("data", datatype="temp"), code=302)


@app.route("/air")
def air():
    return redirect(url_for("data", datatype="air"), code=302)


@app.route("/soil")
def soil():
    return redirect(url_for("data", datatype="soil"), code=302)


@app.route("/")
@app.route("/greenhouse")
def greenhouse():
    return render_template(
        "greenhouse.html", title="Greenhouse")


@app.route("/data/<datatype>")
def data(datatype):
    return render_template(
        "data.html", title=str(datatype).capitalize(), datatype=datatype)


@app.route("/api/temp/<name>")
def api_temp(name):
    temp = json.loads(
        requests.get(
            "https://dt.miet.ru/ppo_it/api/temp_hum/" + str(name),
            headers={"X-Auth-Token": X_AUTH_TOKEN}
            ).content
            )
    return json.dumps({"temp": temp["temperature"]})


@app.route("/api/get_data/<datatype>/<modif>")
def api_get_data(datatype, modif):
    db = Database(get_db())
    sensors = SENSOR_TYPES.get(datatype, [])
    data = [list(map(lambda x: x[-1], db.get(datatype, i, modif))) for i in sensors]
    times = list(map(lambda x: x[3], db.get(datatype, sensors[-1], modif)))
    return {"data": data, "times": times, "headers": sensors}


@app.route("/adddata", methods=["GET", "POST"])
def adddata():
    if request.method == "POST":
        date = request.form["date"]
        time = request.form["time"]
        source = request.form.getlist("source")[0]
        value = request.form["value"]
        # db = Database(get_db())
        # db.add_temp(source, date, time, value)
    return render_template("adddata.html", title="Add Data")


if __name__ == "__main__":
    app.run(debug=True)
