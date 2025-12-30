# from extensions import ma
# from models.visit import Visit

# class VisitSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Visit
#         load_instance = True


from marshmallow import fields
from extensions import ma
from models.visit import Visit

class VisitSchema(ma.SQLAlchemyAutoSchema):
    doctor_id = fields.Int(required=True)
    patient_id = fields.Int(required=True)

    class Meta:
        model = Visit
        load_instance = True
