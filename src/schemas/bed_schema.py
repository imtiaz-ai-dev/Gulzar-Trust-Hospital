# from extensions import ma
# from models.bed import Bed

# class BedSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Bed
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.bed import Bed

class BedSchema(ma.SQLAlchemyAutoSchema):
    ward_id = fields.Int(required=True)   # ADD THIS

    class Meta:
        model = Bed
        load_instance = True
