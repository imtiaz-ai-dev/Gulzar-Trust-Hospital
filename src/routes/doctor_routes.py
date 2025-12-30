from flask import Blueprint, request, jsonify
from extensions import db
from models.doctor import Doctor
from schemas.doctor_schema import DoctorSchema
from flask_jwt_extended import jwt_required

doctor_bp = Blueprint('doctor', __name__)
doctor_schema = DoctorSchema()
doctors_schema = DoctorSchema(many=True)

@doctor_bp.route('/doctors', methods=['POST'])
@jwt_required()
def create_doctor():
    data = request.get_json()
    doctor = doctor_schema.load(data)
    db.session.add(doctor)
    db.session.commit()
    return doctor_schema.jsonify(doctor), 201

@doctor_bp.route('/doctors', methods=['GET'])
@jwt_required()
def get_doctors():
    doctors = Doctor.query.all()
    return doctors_schema.jsonify(doctors)

@doctor_bp.route('/doctors/<int:id>', methods=['GET'])
@jwt_required()
def get_doctor(id):
    doctor = Doctor.query.get_or_404(id)
    return doctor_schema.jsonify(doctor)

@doctor_bp.route('/doctors/<int:id>', methods=['PUT'])
@jwt_required()
def update_doctor(id):
    doctor = Doctor.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
        setattr(doctor, key, value)
    db.session.commit()
    return doctor_schema.jsonify(doctor)

@doctor_bp.route('/doctors/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(id):
    doctor = Doctor.query.get_or_404(id)
    db.session.delete(doctor)
    db.session.commit()
    return jsonify({"msg":"Deleted"}), 200
