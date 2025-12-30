from extensions import ma
from models.patient import Patient
from marshmallow import fields, validate

class PatientSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Patient
        load_instance = True

    name = fields.String(required=True)
    age = fields.Integer(required=True)
    gender = fields.String(required=True, validate=validate.OneOf(["male","female","other"]))
    phone = fields.String(required=True)
