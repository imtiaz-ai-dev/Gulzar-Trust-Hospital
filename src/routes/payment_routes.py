from flask import Blueprint, request, jsonify
from extensions import db
from models.payment import Payment
from schemas.payment_schema import PaymentSchema
from flask_jwt_extended import jwt_required

payment_bp = Blueprint('payment', __name__)
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)

@payment_bp.route('/payments', methods=['POST'])
@jwt_required()
def create_payment():
    data = request.get_json()
    payment = payment_schema.load(data)
    db.session.add(payment)
    db.session.commit()
    return payment_schema.jsonify(payment), 201

@payment_bp.route('/payments', methods=['GET'])
@jwt_required()
def get_payments():
    payments = Payment.query.all()
    return payments_schema.jsonify(payments)
