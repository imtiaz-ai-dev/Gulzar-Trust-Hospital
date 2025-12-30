from extensions import db
from datetime import datetime

class Visit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    visit_type = db.Column(db.Enum('OPD','Emergency'))
    receipt_no = db.Column(db.String(50))
    status = db.Column(db.Enum('checked_in','examined','closed'))
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)




















# CREATE TABLE visits (
#   id INT AUTO_INCREMENT PRIMARY KEY,
#   patient_id INT,
#   doctor_id INT,
#   visit_type ENUM('OPD','Emergency'),
#   receipt_no VARCHAR(50),
#   status ENUM('checked_in','examined','closed'),
#   visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#   FOREIGN KEY (patient_id) REFERENCES patients(id),
#   FOREIGN KEY (doctor_id) REFERENCES doctors(id)