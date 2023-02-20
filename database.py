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
            # if modif == "day":
            #     modif = f"{str(datetime.date.today().year).rjust(2, '0')}.{str(datetime.date.today().month).rjust(2, '0')}.{str(datetime.date.today().day).rjust(2, '0')}"
            # if modif == "month":
            #     modif = f"{str(datetime.date.today().year).rjust(2, '0')}.{str(datetime.date.today().month).rjust(2, '0')}.%"
            # if modif == "year":
            #     modif = f"{str(datetime.date.today().year).rjust(2, '0')}.%.%"
            # if modif == "all":
            #     modif = "%.%.%"
            now = datetime.datetime.now().time()
            if modif == "all":
                modif = "%:%:%"
            elif modif == "minute":
                modif = f"{str(now.hour).rjust(2, '0')}:{str(now.minute).rjust(2, '0')}:%"
            elif modif == "hour":
                modif = f"{str(now.hour).rjust(2, '0')}:%:%"
            self.cur.execute('''SELECT * FROM data
                WHERE (datatype = ?) AND (source = ?) AND (time LIKE ?)
                ORDER BY time''', (datatype, source, modif))
            return self.cur.fetchall()
