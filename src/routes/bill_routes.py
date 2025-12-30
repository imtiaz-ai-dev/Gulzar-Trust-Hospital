from flask import Blueprint, request, jsonify
from extensions import db
from models.bill import Bill
from schemas.bill_schema import BillSchema
from flask_jwt_extended import jwt_required

bill_bp = Blueprint('bill', __name__)
bill_schema = BillSchema()
bills_schema = BillSchema(many=True)

@bill_bp.route('/bills', methods=['POST'])
@jwt_required()
def create_bill():
    data = request.get_json()
    bill = bill_schema.load(data)
    db.session.add(bill)
    db.session.commit()
    return bill_schema.jsonify(bill), 201

@bill_bp.route('/bills', methods=['GET'])
@jwt_required()
def get_bills():
    bills = Bill.query.all()
    return bills_schema.jsonify(bills)
