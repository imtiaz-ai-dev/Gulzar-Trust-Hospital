from extensions import db
from datetime import datetime

class Vital(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admission_id = db.Column(db.Integer, db.ForeignKey('admission.id'))
    bp = db.Column(db.String(20))
    temperature = db.Column(db.String(10))
    pulse = db.Column(db.String(10))
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    