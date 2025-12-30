from flask import Blueprint, request, jsonify
from extensions import db
from models.department import Department
from schemas.department_schema import DepartmentSchema
from flask_jwt_extended import jwt_required

department_bp = Blueprint('department', __name__)
department_schema = DepartmentSchema()
departments_schema = DepartmentSchema(many=True)

@department_bp.route('/departments', methods=['POST'])
@jwt_required()
def create_department():
    data = request.get_json()
    department = department_schema.load(data)
    db.session.add(department)
    db.session.commit()
    return department_schema.jsonify(department), 201

@department_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    departments = Department.query.all()
    return departments_schema.jsonify(departments)
