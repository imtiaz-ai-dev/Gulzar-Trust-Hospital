from extensions import ma
from models.prescription_item import PrescriptionItem

class PrescriptionItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PrescriptionItem
        load_instance = True
