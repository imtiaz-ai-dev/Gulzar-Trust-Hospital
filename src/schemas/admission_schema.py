# from extensions import ma
# from models.admission import Admission

# class AdmissionSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = Admission
#         load_instance = True

from marshmallow import fields
from extensions import ma
from models.admission import Admission

class AdmissionSchema(ma.SQLAlchemyAutoSchema):
    bed_id = fields.Int(required=True)
    doctor_id = fields.Int(required=True)
    patient_id = fields.Int(required=True)
    admission_date = fields.Date(required=True)
    ward_id = fields.Int(required=True)

    class Meta:
        model = Admission
        load_instance = True
