# from extensions import ma
# from models.nursing_note import NursingNote

# class NursingNoteSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         model = NursingNote
#         load_instance = True
from marshmallow import fields
from extensions import ma
from models.nursing_note import NursingNote

class NursingNoteSchema(ma.SQLAlchemyAutoSchema):
    admission_id = fields.Int(required=True)
    note_date = fields.Date(required=True)

    class Meta:
        model = NursingNote
        load_instance = True
