# from extensions import ma
# from models.doctor import Doctor
# from marshmallow import fields

# class DoctorSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Doctor
#         load_instance = True

from extensions import ma
from models.doctor import Doctor
from marshmallow import fields

class DoctorSchema(ma.SQLAlchemyAutoSchema):
    user_id = fields.Int(required=True)
    department_id = fields.Int(required=True)

    class Meta:
        model = Doctor
        load_instance = True
