import sqlite3


class Database:
    def __init__(self, con):
        self.con = con
        self.cur = con.cursor()

    def add_temp(self, source, date, time, value):
        self.cur.execute('''INSERT INTO temp(source, date, time, val)
            VALUES (?, ?, ?, ?);''', (source, date, time, value))
        self.con.commit()

    def get_temp(self, source):
        self.cur.execute('''SELECT * FROM temp
            WHERE source = ?
            ORDER BY date''', (source, ))
        return self.cur.fetchall()
