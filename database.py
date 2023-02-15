import sqlite3
import datetime


class Database:
    def __init__(self, con):
        self.con = con
        self.cur = con.cursor()

    def add(self, datatype, source, date, time, value):
        self.cur.execute('''INSERT INTO data(datatype, source, date, time, val)
            VALUES (?, ?, ?, ?, ?);''', (datatype, source, date, time, value))
        self.con.commit()

    def get(self, datatype, source, modif=None):
        if modif is None:
            self.cur.execute('''SELECT * FROM data
                WHERE (datatype = ?) AND (source = ?)
                ORDER BY time, date''', (datatype, source, ))
            return self.cur.fetchall()
        else:
            if modif == "day":
                modif = f"{datetime.date.today().year}.{datetime.date.today().month}.{datetime.date.today().day}"
            if modif == "month":
                modif = f"{datetime.date.today().year}.{datetime.date.today().month}.%"
            if modif == "year":
                modif = f"{datetime.date.today().year}.%.%"
            if modif == "all":
                modif = "%.%.%"
            self.cur.execute('''SELECT * FROM data
                WHERE (datatype = ?) AND (source = ?) AND (date LIKE ?)
                ORDER BY date''', (datatype, source, modif))
            return self.cur.fetchall()
