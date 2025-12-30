# from extensions import ma
# from models.lab_order import LabOrder

# class LabOrderSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = LabOrder
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.lab_order import LabOrder

class LabOrderSchema(ma.SQLAlchemyAutoSchema):
    visit_id = fields.Int(required=True)
    order_date = fields.Date(required=True)

    class Meta:
        model = LabOrder
        load_instance = True
