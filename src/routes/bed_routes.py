from flask import Blueprint, request, jsonify
from extensions import db
from models.bed import Bed
from schemas.bed_schema import BedSchema
from flask_jwt_extended import jwt_required

bed_bp = Blueprint('bed', __name__)
bed_schema = BedSchema()
beds_schema = BedSchema(many=True)

@bed_bp.route('/beds', methods=['POST'])
@jwt_required()
def create_bed():
    data = request.get_json()
    bed = bed_schema.load(data)
    db.session.add(bed)
    db.session.commit()
    return bed_schema.jsonify(bed), 201

@bed_bp.route('/beds', methods=['GET'])
@jwt_required()
def get_beds():
    beds = Bed.query.all()
    return beds_schema.jsonify(beds)
