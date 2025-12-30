from flask import Blueprint, request, jsonify
from extensions import db
from models.visit import Visit
from schemas.visit_schema import VisitSchema
from flask_jwt_extended import jwt_required

visit_bp = Blueprint('visit', __name__)
visit_schema = VisitSchema()
visits_schema = VisitSchema(many=True)

@visit_bp.route('/visits', methods=['POST'])
@jwt_required()
def create_visit():
    data = request.get_json()
    visit = visit_schema.load(data)
    db.session.add(visit)
    db.session.commit()
    return visit_schema.jsonify(visit), 201

@visit_bp.route('/visits', methods=['GET'])
@jwt_required()
def get_visits():
    visits = Visit.query.all()
    return visits_schema.jsonify(visits)
