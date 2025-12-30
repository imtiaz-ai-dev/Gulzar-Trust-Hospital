from flask import Blueprint, request, jsonify
from extensions import db
from models.prescription import Prescription
from schemas.prescription_schema import PrescriptionSchema
from flask_jwt_extended import jwt_required

prescription_bp = Blueprint('prescription', __name__)
prescription_schema = PrescriptionSchema()
prescriptions_schema = PrescriptionSchema(many=True)

@prescription_bp.route('/prescriptions', methods=['POST'])
@jwt_required()
def create_prescription():
    data = request.get_json()
    presc = prescription_schema.load(data)
    db.session.add(presc)
    db.session.commit()
    return prescription_schema.jsonify(presc), 201

@prescription_bp.route('/prescriptions', methods=['GET'])
@jwt_required()
def get_prescriptions():
    prescriptions = Prescription.query.all()
    return prescriptions_schema.jsonify(prescriptions)
