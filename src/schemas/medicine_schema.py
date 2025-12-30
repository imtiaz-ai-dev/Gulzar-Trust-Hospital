# from extensions import ma
# from models.medicine import Medicine

# class MedicineSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Medicine
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.medicine import Medicine

class MedicineSchema(ma.SQLAlchemyAutoSchema):
    stock = fields.Int(required=True)
    price = fields.Float(required=True)
    description = fields.Str()

    class Meta:
        model = Medicine
        load_instance = True
