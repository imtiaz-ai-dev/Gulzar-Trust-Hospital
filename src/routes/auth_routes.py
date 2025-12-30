from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User, generate_password_hash
from schemas.user_schema import UserSchema
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()

# ================= REGISTER =================
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        user = user_schema.load(data)

        user.password_hash = generate_password_hash(data["password"])

        db.session.add(user)
        db.session.commit()

        return user_schema.jsonify(user), 201

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 400

    except Exception as e:
        db.session.rollback()
        print("Register error:", e)
        return jsonify({"error": "Internal Server Error"}), 500


# ================= LOGIN =================
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        user = User.query.filter_by(email=data.get("email")).first()

        if not user or not user.check_password(data.get("password")):
            return jsonify({"error": "Invalid email or password"}), 401

        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )

        return jsonify({"access_token": token}), 200

    except Exception as e:
        print("Login error:", e)
        return jsonify({"error": "Internal Server Error"}), 500


# ============ ADMIN CREATE USER ============
@auth_bp.route('/admin/create-user', methods=['POST'])
@jwt_required()
def admin_create_user():
    try:
        claims = get_jwt()

        if claims["role"] != "admin":
            return jsonify({"error": "Admin only"}), 403

        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        user = user_schema.load(data)

        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        return jsonify({"msg": "User created successfully"}), 201

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 400

    except Exception as e:
        db.session.rollback()
        print("Admin create user error:", e)
        return jsonify({"error": "Internal Server Error"}), 500




@auth_bp.route("/admin/users", methods=["GET"])
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin only"}), 403

    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "department": u.department
        } for u in users
    ])



# from flask import Blueprint, request, jsonify
# from extensions import db
# from models.user import User , generate_password_hash, check_password_hash
# from schemas.user_schema import UserSchema
# from flask_jwt_extended import create_access_token
# from flask_jwt_extended import jwt_required, get_jwt
# from datetime import timedelta


# auth_bp = Blueprint('auth', __name__)
# user_schema = UserSchema()

# # Register
# @auth_bp.route('/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     user = User(
#         name=data['name'],
#         email=data['email'],
#         password_hash=generate_password_hash(data["password"]),
#         role=data['role']
#     )
#     db.session.add(user)
#     db.session.commit()
#     return user_schema.jsonify(user), 201

# @auth_bp.route("/login", methods=["POST"])
# def login():
#     data = request.json
#     user = User.query.filter_by(email=data["email"]).first()

#     if not user or not user.check_password(data["password"]):
#         return jsonify({"msg": "Invalid email or password"}), 401

#     # # ✅ Admin only
#     # if user.role != "admin":
#     #     return jsonify({"msg": "Admin only login allowed"}), 403

#     token = create_access_token(
#         identity=str(user.id),
#         additional_claims={
#             "role": user.role,
#             "department": user.department
#         }
#     )

#     return jsonify({"access_token": token})

# # # Login
# # @auth_bp.route('/login', methods=['POST'])
# # def login():
# #     data = request.get_json()
# #     user = User.query.filter_by(email=data['email']).first()
# #     if user and user.check_password(data['password']):
# #         token = create_access_token(identity=str({"id": user.id, "role": user.role}))
# #         return jsonify({"access_token": token}), 200
# #     return jsonify({"msg": "Invalid credentials"}), 401

# @auth_bp.route('/admin/create-user', methods=['POST'])
# @jwt_required()
# def admin_create_user():
#     claims = get_jwt()

#     if claims["role"] != "admin":
#         return jsonify({"msg": "Admin only"}), 403

#     data = request.json
#     user = User(
#         name=data["name"],
#         email=data["email"],
#         role=data["role"],
#         department=data["department"]
#     )
#     user.set_password(data["password"])

#     db.session.add(user)
#     db.session.commit()

#     return jsonify({"msg": "User created successfully"}), 201
# # # Protected route example