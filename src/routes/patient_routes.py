from flask import Blueprint, request, jsonify
from extensions import db
from models.patient import Patient
from schemas.patient_schema import PatientSchema
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError

patient_bp = Blueprint('patient', __name__)
patient_schema = PatientSchema()
patients_schema = PatientSchema(many=True)

# Create patient
@patient_bp.route('/patients', methods=['POST'])
@jwt_required()
def create_patient():
    try:
        data = request.get_json()
        patient = patient_schema.load(data)
        db.session.add(patient)
        db.session.commit()
        return patient_schema.jsonify(patient), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "error": "MRN already exists"
        }), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": str(e)
        }), 500


# Get all patients
@patient_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    try:
        patients = Patient.query.all()
        return patients_schema.jsonify(patients)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get single patient
@patient_bp.route('/patients/<int:id>', methods=['GET'])
@jwt_required()
def get_patient(id):
    try:
        patient = Patient.query.get_or_404(id)
        return patient_schema.jsonify(patient)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update patient
@patient_bp.route('/patients/<int:id>', methods=['PUT'])
@jwt_required()
def update_patient(id):
    try:
        patient = Patient.query.get_or_404(id)
        data = request.get_json()

        for key, value in data.items():
            setattr(patient, key, value)

        db.session.commit()
        return patient_schema.jsonify(patient)

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "error": "MRN already exists"
        }), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": str(e)
        }), 500


# Delete patient
@patient_bp.route('/patients/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_patient(id):
    try:
        patient = Patient.query.get_or_404(id)
        db.session.delete(patient)
        db.session.commit()
        return jsonify({"msg": "Deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



# from flask import Blueprint, request, jsonify
# from extensions import db
# from models.patient import Patient
# from schemas.patient_schema import PatientSchema
# from flask_jwt_extended import jwt_required

# patient_bp = Blueprint('patient', __name__)
# patient_schema = PatientSchema()
# patients_schema = PatientSchema(many=True)

# # Create patient
# @patient_bp.route('/patients', methods=['POST'])
# @jwt_required()
# def create_patient():
#     data = request.get_json()
#     patient = patient_schema.load(data)
#     db.session.add(patient)
#     db.session.commit()
#     return patient_schema.jsonify(patient), 201

# # Get all patients
# @patient_bp.route('/patients', methods=['GET'])
# @jwt_required()
# def get_patients():
#     patients = Patient.query.all()
#     return patients_schema.jsonify(patients)

# # Get single patient
# @patient_bp.route('/patients/<int:id>', methods=['GET'])
# @jwt_required()
# def get_patient(id):
#     patient = Patient.query.get_or_404(id)
#     return patient_schema.jsonify(patient)

# # Update patient
# @patient_bp.route('/patients/<int:id>', methods=['PUT'])
# @jwt_required()
# def update_patient(id):
#     patient = Patient.query.get_or_404(id)
#     data = request.get_json()
#     for key, value in data.items():
#         setattr(patient, key, value)
#     db.session.commit()
#     return patient_schema.jsonify(patient)

# # Delete patient
# @patient_bp.route('/patients/<int:id>', methods=['DELETE'])
# @jwt_required()
# def delete_patient(id):
#     patient = Patient.query.get_or_404(id)
#     db.session.delete(patient)
#     db.session.commit()
#     return jsonify({"msg":"Deleted"}), 200
