# from extensions import ma
# from models.ward import Ward

# class WardSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Ward
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.ward import Ward

class WardSchema(ma.SQLAlchemyAutoSchema):
    floor = fields.Int(required=True)  # Add this

    class Meta:
        model = Ward
        load_instance = True
