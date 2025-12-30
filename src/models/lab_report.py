from extensions import db
from datetime import datetime

class LabReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lab_order_id = db.Column(db.Integer, db.ForeignKey('lab_order.id'))
    report_file = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
