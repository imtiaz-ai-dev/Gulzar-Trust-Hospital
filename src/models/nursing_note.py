from extensions import db
from datetime import datetime

class NursingNote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admission_id = db.Column(db.Integer, db.ForeignKey('admission.id'))
    nurse_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
