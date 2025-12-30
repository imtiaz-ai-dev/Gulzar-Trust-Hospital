from flask import Blueprint, request, jsonify
from extensions import db
from models.ward import Ward
from schemas.ward_schema import WardSchema
from flask_jwt_extended import jwt_required

ward_bp = Blueprint('ward', __name__)
ward_schema = WardSchema()
wards_schema = WardSchema(many=True)

@ward_bp.route('/wards', methods=['POST'])
@jwt_required()
def create_ward():
    data = request.get_json()
    ward = ward_schema.load(data)
    db.session.add(ward)
    db.session.commit()
    return ward_schema.jsonify(ward), 201

@ward_bp.route('/wards', methods=['GET'])
@jwt_required()
def get_wards():
    wards = Ward.query.all()
    return wards_schema.jsonify(wards)
