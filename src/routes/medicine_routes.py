from flask import Blueprint, request, jsonify
from extensions import db
from models.medicine import Medicine
from schemas.medicine_schema import MedicineSchema
from flask_jwt_extended import jwt_required

medicine_bp = Blueprint('medicine', __name__)
medicine_schema = MedicineSchema()
medicines_schema = MedicineSchema(many=True)

@medicine_bp.route('/medicines', methods=['POST'])
@jwt_required()
def create_medicine():
    data = request.get_json()
    medicine = medicine_schema.load(data)
    db.session.add(medicine)
    db.session.commit()
    return medicine_schema.jsonify(medicine), 201

@medicine_bp.route('/medicines', methods=['GET'])
@jwt_required()
def get_medicines():
    medicines = Medicine.query.all()
    return medicines_schema.jsonify(medicines)
