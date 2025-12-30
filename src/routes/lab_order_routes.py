from flask import Blueprint, request, jsonify
from extensions import db
from models.lab_order import LabOrder
from schemas.lab_order_schema import LabOrderSchema
from flask_jwt_extended import jwt_required

lab_order_bp = Blueprint('lab_order', __name__)
lab_order_schema = LabOrderSchema()
lab_orders_schema = LabOrderSchema(many=True)

@lab_order_bp.route('/lab_orders', methods=['POST'])
@jwt_required()
def create_lab_order():
    data = request.get_json()
    order = lab_order_schema.load(data)
    db.session.add(order)
    db.session.commit()
    return lab_order_schema.jsonify(order), 201

@lab_order_bp.route('/lab_orders', methods=['GET'])
@jwt_required()
def get_lab_orders():
    orders = LabOrder.query.all()
    return lab_orders_schema.jsonify(orders)
