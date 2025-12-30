# from extensions import ma
# from models.payment import Payment

# class PaymentSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Payment
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.payment import Payment

class PaymentSchema(ma.SQLAlchemyAutoSchema):
    bill_id = fields.Int(required=True)
    payment_method = fields.Str(required=True)
    payment_date = fields.Date(required=True)

    class Meta:
        model = Payment
        load_instance = True
