# from extensions import ma
# from models.bill import Bill

# class BillSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Bill
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.bill import Bill

class BillSchema(ma.SQLAlchemyAutoSchema):
    admission_id = fields.Int(required=True)   # ADD THIS

    class Meta:
        model = Bill
        load_instance = True
