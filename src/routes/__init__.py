from .auth_routes import auth_bp
from .patient_routes import patient_bp
from .doctor_routes import doctor_bp
from .department_routes import department_bp
from .visit_routes import visit_bp
from .admission_routes import admission_bp
from .ward_routes import ward_bp
from .bed_routes import bed_bp
from .medicine_routes import medicine_bp
from .prescription_routes import prescription_bp
from .bill_routes import bill_bp
from .payment_routes import payment_bp
from .lab_order_routes import lab_order_bp
from .lab_report_routes import lab_report_bp
from .nursing_note_routes import nursing_bp
from .vital_routes import vital_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api')
    app.register_blueprint(doctor_bp, url_prefix='/api')
    app.register_blueprint(department_bp, url_prefix='/api')
    app.register_blueprint(visit_bp, url_prefix='/api')
    app.register_blueprint(admission_bp, url_prefix='/api')
    app.register_blueprint(ward_bp, url_prefix='/api')
    app.register_blueprint(bed_bp, url_prefix='/api')
    app.register_blueprint(medicine_bp, url_prefix='/api')
    app.register_blueprint(prescription_bp, url_prefix='/api')
    app.register_blueprint(bill_bp, url_prefix='/api')
    app.register_blueprint(payment_bp, url_prefix='/api')
    app.register_blueprint(lab_order_bp, url_prefix='/api')
    app.register_blueprint(lab_report_bp, url_prefix='/api')
    app.register_blueprint(nursing_bp, url_prefix='/api')
    app.register_blueprint(vital_bp, url_prefix='/api')
    # app.register_blueprint(auth_bp, url_prefix="/auth")