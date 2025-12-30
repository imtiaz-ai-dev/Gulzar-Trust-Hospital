# from extensions import ma
# from models.vital import Vital

# class VitalSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Vital
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.vital import Vital

class VitalSchema(ma.SQLAlchemyAutoSchema):
    admission_id = fields.Int(required=True)
    temperature = fields.Float(required=True)   # change to Float if sending numbers
    pulse = fields.Float(required=True)         # change to Float if sending numbers
    respiration = fields.Float(required=True)
    vital_date = fields.Date(required=True)

    class Meta:
        model = Vital
        load_instance = True
