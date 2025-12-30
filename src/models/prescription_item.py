from extensions import db

class PrescriptionItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    prescription_id = db.Column(db.Integer, db.ForeignKey('prescription.id'))
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicine.id'))
    dose = db.Column(db.String(50))
    duration = db.Column(db.String(50))
