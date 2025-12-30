from flask import Blueprint, request, jsonify
from extensions import db
from models.lab_report import LabReport
from schemas.lab_report_schema import LabReportSchema
from flask_jwt_extended import jwt_required

lab_report_bp = Blueprint('lab_report', __name__)
lab_report_schema = LabReportSchema()
lab_reports_schema = LabReportSchema(many=True)

@lab_report_bp.route('/lab_reports', methods=['POST'])
@jwt_required()
def create_lab_report():
    data = request.get_json()
    report = lab_report_schema.load(data)
    db.session.add(report)
    db.session.commit()
    return lab_report_schema.jsonify(report), 201

@lab_report_bp.route('/lab_reports', methods=['GET'])
@jwt_required()
def get_lab_reports():
    reports = LabReport.query.all()
    return lab_reports_schema.jsonify(reports)
