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
                ORDER BY date''', (source, ))
            return self.cur.fetchall()
        else:
            if modif == "day":
                modif = "%.%." + str(datetime.date.today().day)
            self.cur.execute('''SELECT * FROM temp
                WHERE (source = ?) AND (date LIKE ?)
                ORDER BY date''', (source, modif))
            return self.cur.fetchall()
