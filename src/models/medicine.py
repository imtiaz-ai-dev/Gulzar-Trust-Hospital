from extensions import db

class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    stock_qty = db.Column(db.Integer)
    unit_price = db.Column(db.Numeric(10,2))
