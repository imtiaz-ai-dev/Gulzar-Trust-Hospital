from flask import Blueprint, request, jsonify
from extensions import db
from models.admission import Admission
from schemas.admission_schema import AdmissionSchema
from flask_jwt_extended import jwt_required

admission_bp = Blueprint('admission', __name__)
admission_schema = AdmissionSchema()
admissions_schema = AdmissionSchema(many=True)

@admission_bp.route('/admissions', methods=['POST'])
@jwt_required()
def create_admission():
    data = request.get_json()
    admission = admission_schema.load(data)
    db.session.add(admission)
    db.session.commit()
    return admission_schema.jsonify(admission), 201

@admission_bp.route('/admissions', methods=['GET'])
@jwt_required()
def get_admissions():
    admissions = Admission.query.all()
    return admissions_schema.jsonify(admissions)
