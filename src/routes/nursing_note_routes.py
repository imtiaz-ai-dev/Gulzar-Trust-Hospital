from flask import Blueprint, request, jsonify
from extensions import db
from models.nursing_note import NursingNote
from schemas.nursing_note_schema import NursingNoteSchema
from flask_jwt_extended import jwt_required

nursing_bp = Blueprint('nursing', __name__)
nursing_schema = NursingNoteSchema()
nursing_notes_schema = NursingNoteSchema(many=True)

@nursing_bp.route('/nursing_notes', methods=['POST'])
@jwt_required()
def create_nursing_note():
    data = request.get_json()
    note = nursing_schema.load(data)
    db.session.add(note)
    db.session.commit()
    return nursing_schema.jsonify(note), 201

@nursing_bp.route('/nursing_notes', methods=['GET'])
@jwt_required()
def get_nursing_notes():
    notes = NursingNote.query.all()
    return nursing_notes_schema.jsonify(notes)
