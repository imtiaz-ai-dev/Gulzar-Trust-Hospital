# from extensions import ma
# from models.lab_report import LabReport

# class LabReportSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = LabReport
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.lab_report import LabReport

class LabReportSchema(ma.SQLAlchemyAutoSchema):
    lab_order_id = fields.Int(required=True)
    report_details = fields.Str(required=True)
    report_date = fields.Date(required=True)

    class Meta:
        model = LabReport
        load_instance = True
