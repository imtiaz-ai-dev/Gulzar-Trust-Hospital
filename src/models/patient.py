from extensions import db

class Patient(db.Model):
    __tablename__ = 'patient'
    id = db.Column(db.Integer, primary_key=True)
    mrn = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(100))
    gender = db.Column(db.Enum('male','female','other'))
    age = db.Column(db.Integer)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
