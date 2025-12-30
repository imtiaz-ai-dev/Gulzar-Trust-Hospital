from extensions import db
from datetime import datetime

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bill.id'))
    amount = db.Column(db.Numeric(10,2))
    method = db.Column(db.Enum('cash','card'))
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)
