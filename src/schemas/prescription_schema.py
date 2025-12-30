# from extensions import ma
# from models.prescription import Prescription

# class PrescriptionSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Prescription
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.prescription import Prescription

class PrescriptionSchema(ma.SQLAlchemyAutoSchema):
    dose = fields.Str(required=True)
    duration = fields.Str(required=True)
    frequency = fields.Str(required=True)
    medicine_id = fields.Int(required=True)
    visit_id = fields.Int(required=True)

    class Meta:
        model = Prescription
        load_instance = True
