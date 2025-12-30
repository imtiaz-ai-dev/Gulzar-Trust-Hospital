from extensions import db
from datetime import datetime

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    admission_id = db.Column(db.Integer, db.ForeignKey('admission.id'))
    total_amount = db.Column(db.Numeric(10,2))
    status = db.Column(db.Enum('unpaid','paid'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
