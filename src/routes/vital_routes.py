from flask import Blueprint, request, jsonify
from extensions import db
from models.vital import Vital
from schemas.vital_schema import VitalSchema
from flask_jwt_extended import jwt_required

vital_bp = Blueprint('vital', __name__)
vital_schema = VitalSchema()
vitals_schema = VitalSchema(many=True)

@vital_bp.route('/vitals', methods=['POST'])
@jwt_required()
def create_vital():
    data = request.get_json()
    vital = vital_schema.load(data)
    db.session.add(vital)
    db.session.commit()
    return vital_schema.jsonify(vital), 201

@vital_bp.route('/vitals', methods=['GET'])
@jwt_required()
def get_vitals():
    vitals = Vital.query.all()
    return vitals_schema.jsonify(vitals)
