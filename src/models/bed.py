from extensions import db

class Bed(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ward_id = db.Column(db.Integer, db.ForeignKey('ward.id'))
    bed_no = db.Column(db.String(20))
    status = db.Column(db.Enum('available','occupied'), default='available')
