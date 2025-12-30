from extensions import db
from datetime import datetime

class Admission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))
    visit_id = db.Column(db.Integer, db.ForeignKey('visit.id'))
    admit_date = db.Column(db.DateTime, default=datetime.utcnow)
    discharge_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.Enum('admitted','discharged'))
