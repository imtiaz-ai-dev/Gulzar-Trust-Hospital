from extensions import db

class LabOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admission_id = db.Column(db.Integer, db.ForeignKey('admission.id'))
    test_name = db.Column(db.String(100))
    status = db.Column(db.Enum('pending','completed'))
