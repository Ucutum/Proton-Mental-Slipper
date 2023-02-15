import sqlite3
import datetime


class Database:
    def __init__(self, con):
        self.con = con
        self.cur = con.cursor()

    def add_temp(self, source, date, time, value):
        self.cur.execute('''INSERT INTO temp(source, date, time, val)
            VALUES (?, ?, ?, ?);''', (source, date, time, value))
        self.con.commit()

    def get_temp(self, source, modif=None):
        if modif is None:
            self.cur.execute('''SELECT * FROM temp
                WHERE source = ?
                ORDER BY time, date''', (source, ))
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
            self.cur.execute('''SELECT * FROM temp
                WHERE (source = ?) AND (date LIKE ?)
                ORDER BY date''', (source, modif))
            return self.cur.fetchall()
