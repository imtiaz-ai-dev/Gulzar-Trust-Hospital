// Hospital Management System JavaScript

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';
let accessToken = localStorage.getItem('token');

// Data Storage (will be fetched from API)
let patients = [];
let doctors = [];
let departments = [];
let visits = [];
let admissions = [];
let wards = [];
let beds = [];
let appointments = [];
let bills = [];
let medicines = [];
let labTests = [];
let inventory = [];
let staff = [];
let emergencyCases = [];
let notifications = [];
let users = [];
let currentUser = null;

// Chart instances
let visitsChart = null;
let departmentChart = null;

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
            document.getElementById('userName').textContent = currentUser.name;
            
            if (currentUser.role === 'admin') {
                document.querySelectorAll('.admin-only').forEach(element => {
                    element.style.display = 'block';
                });
            }
            
            hideRestrictedSections(currentUser);
            showSection('overview');
            updateDashboardStats();
            return true;
        } catch (e) {
            localStorage.removeItem('currentUser');
        }
    }
    return false;
}

async function loadDataFromAPI() {
    try {
        // Load all data in parallel
        const [
            patientsRes, doctorsRes, departmentsRes, visitsRes, admissionsRes,
            wardsRes, bedsRes, appointmentsRes, billsRes, medicinesRes,
            labTestsRes, inventoryRes, staffRes, emergencyRes, notificationsRes, usersRes
        ] = await Promise.allSettled([
            apiRequest('/patients'),
            apiRequest('/doctors'),
            apiRequest('/departments'),
            apiRequest('/visits'),
            apiRequest('/admissions'),
            apiRequest('/wards'),
            apiRequest('/beds'),
            apiRequest('/appointments'),
            apiRequest('/bills'),
            apiRequest('/medicines'),
            apiRequest('/lab_orders'),
            apiRequest('/inventory'), // May not exist yet
            apiRequest('/staff'), // May not exist yet
            apiRequest('/emergency'), // May not exist yet
            apiRequest('/notifications'), // May not exist yet
            (currentUser && currentUser.role === 'admin' ? apiRequest('/auth/admin/users') : Promise.reject(new Error('Not admin')))
        ]);

        patients = patientsRes.status === 'fulfilled' ? patientsRes.value : [];
        doctors = doctorsRes.status === 'fulfilled' ? doctorsRes.value : [];
        departments = departmentsRes.status === 'fulfilled' ? departmentsRes.value : [];
        visits = visitsRes.status === 'fulfilled' ? visitsRes.value : [];
        admissions = admissionsRes.status === 'fulfilled' ? admissionsRes.value : [];
        wards = wardsRes.status === 'fulfilled' ? wardsRes.value : [];
        beds = bedsRes.status === 'fulfilled' ? bedsRes.value : [];
        appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value : [];
        bills = billsRes.status === 'fulfilled' ? billsRes.value : [];
        medicines = medicinesRes.status === 'fulfilled' ? medicinesRes.value : [];
        labTests = labTestsRes.status === 'fulfilled' ? labTestsRes.value : [];
        inventory = inventoryRes.status === 'fulfilled' ? inventoryRes.value : [];
        staff = staffRes.status === 'fulfilled' ? staffRes.value : [];
        emergencyCases = emergencyRes.status === 'fulfilled' ? emergencyRes.value : [];
        notifications = notificationsRes.status === 'fulfilled' ? notificationsRes.value : [];
        users = usersRes.status === 'fulfilled' ? usersRes.value : [];

    } catch (error) {
        console.error('Failed to load data:', error);
        alert('Failed to load data from server. Please check your connection.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load sample data first
    loadSampleData();
    loadNewSampleData();
    
    if (!checkAuth()) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }
    
    initializeNavigation();
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple local authentication
    const validUsers = {
        'admin@hospital.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
        'doctor@hospital.com': { password: 'doctor123', role: 'doctor', name: 'Dr. Ahmed' },
        'nurse@hospital.com': { password: 'nurse123', role: 'nurse', name: 'Nurse Sarah' }
    };

    const user = validUsers[email];
    if (user && user.password === password) {
        currentUser = {
            email: email,
            role: user.role,
            name: user.name,
            permissions: user.role === 'admin' ? ['all'] : ['patients', 'visits', 'appointments']
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        document.getElementById('dashboard').style.display = 'block';

        document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
        document.getElementById('userName').textContent = currentUser.name;

        if (currentUser.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(element => {
                element.style.display = 'block';
            });
        }

        hideRestrictedSections(currentUser);
        showSection('overview');
        updateDashboardStats();

    } else {
        alert('Invalid email or password!');
    }
}

// Hide sections based on user permissions
function hideRestrictedSections(user) {
    const allNavItems = document.querySelectorAll('.nav-item');
    
    allNavItems.forEach(navItem => {
        const section = navItem.getAttribute('data-section');
        
        // Always show overview and notifications
        if (section === 'overview' || section === 'notifications') {
            navItem.style.display = 'block';
            return;
        }
        
        // Show admin panel only for admin
        if (section === 'admin') {
            navItem.style.display = user.role === 'admin' ? 'block' : 'none';
            return;
        }
        
        // Check if user has permission for this section
        if (user.permissions.includes('all') || user.permissions.includes(section)) {
            navItem.style.display = 'block';
        } else {
            navItem.style.display = 'none';
        }
    });
}

// Navigation handler
function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Check if user has permission to access this section
            if (!hasPermission(section)) {
                alert('Access denied! You do not have permission to access this section.');
                return;
            }
            
            showSection(section);
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Check if current user has permission for a section
function hasPermission(section) {
    if (!currentUser) return false;
    
    // Always allow overview and notifications
    if (section === 'overview' || section === 'notifications') return true;
    
    // Admin has access to everything
    if (currentUser.role === 'admin') return true;
    
    // Check specific permissions - allow full CRUD access
    return currentUser.permissions.includes('all') || currentUser.permissions.includes(section);
}

// Check if user can perform CRUD operations
function canPerformCRUD(section) {
    if (!currentUser) return false;
    
    // Admin can do everything
    if (currentUser.role === 'admin') return true;
    
    // Check if user has permission for this section
    return hasPermission(section);
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Show/hide Add buttons based on permissions
    const addButtons = {
        'patients': 'button[data-bs-target="#patientModal"]',
        'doctors': 'button[data-bs-target="#doctorModal"]',
        'departments': 'button[data-bs-target="#departmentModal"]',
        'visits': 'button[data-bs-target="#visitModal"]',
        'admissions': 'button[data-bs-target="#admissionModal"]',
        'wards': 'button[data-bs-target="#wardModal"]',
        'beds': 'button[data-bs-target="#bedModal"]',
        'appointments': 'button[data-bs-target="#appointmentModal"]',
        'billing': 'button[data-bs-target="#billModal"]',
        'pharmacy': 'button[data-bs-target="#medicineModal"]',
        'lab': 'button[data-bs-target="#labTestModal"]',
        'inventory': 'button[data-bs-target="#inventoryModal"]',
        'staff': 'button[data-bs-target="#staffModal"]',
        'emergency': 'button[data-bs-target="#emergencyModal"]',
        'admin': 'button[data-bs-target="#addUserModal"]'
    };
    
    if (addButtons[sectionName]) {
        const addButton = document.querySelector(addButtons[sectionName]);
        if (addButton) {
            addButton.style.display = canPerformCRUD(sectionName) ? 'inline-block' : 'none';
        }
    }
    
    // Update page title
    const titles = {
        'overview': 'Dashboard',
        'admin': 'Admin Panel',
        'patients': 'Patients Management',
        'doctors': 'Doctors Management',
        'departments': 'Departments Management',
        'visits': 'Visits Management',
        'admissions': 'Admissions Management',
        'wards': 'Wards Management',
        'beds': 'Beds Management',
        'appointments': 'Appointments Management',
        'billing': 'Billing Management',
        'pharmacy': 'Pharmacy Management',
        'lab': 'Laboratory Management',
        'reports': 'Reports & Analytics'
    };
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.innerHTML = `<i class="fas fa-hospital"></i> ${titles[sectionName] || 'Gulzar Trust Hospital - HMS'}`;
    }
    
    // Load section data
    switch(sectionName) {
        case 'overview':
            updateDashboardStats();
            break;
        case 'admin':
            loadUsersTable();
            updateUserDepartmentDropdown();
            break;
        case 'patients':
            loadPatientsTable();
            break;
        case 'doctors':
            loadDoctorsTable();
            break;
        case 'departments':
            loadDepartmentsTable();
            break;
        case 'visits':
            loadVisitsTable();
            break;
        case 'admissions':
            loadAdmissionsTable();
            break;
        case 'wards':
            loadWardsTable();
            break;
        case 'beds':
            loadBedsTable();
            break;
        case 'appointments':
            loadAppointmentsTable();
            updateDoctorDropdowns();
            break;
        case 'billing':
            loadBillingTable();
            break;
        case 'pharmacy':
            loadPharmacyTable();
            break;
        case 'lab':
            loadLabTable();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    // Set user name
    document.getElementById('userName').textContent = currentUser ? currentUser.name : 'User';
    
    // Update current date and time
    updateDateTime();
    
    // Basic stats
    document.getElementById('totalPatients').textContent = patients.length;
    document.getElementById('totalDoctors').textContent = doctors.length;
    document.getElementById('totalAdmissions').textContent = admissions.filter(a => a.status === 'Active').length;
    
    const todayVisits = visits.filter(v => {
        const today = new Date().toDateString();
        return new Date(v.date).toDateString() === today;
    });
    document.getElementById('totalVisits').textContent = todayVisits.length;
    
    // Enhanced stats
    const newPatientsToday = patients.filter(p => {
        const today = new Date().toDateString();
        return new Date(p.createdAt).toDateString() === today;
    }).length;
    document.getElementById('newPatientsToday').textContent = newPatientsToday;
    
    document.getElementById('activeDoctors').textContent = doctors.length;
    
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    document.getElementById('bedOccupancy').textContent = occupancyRate;
    
    const pendingVisits = visits.filter(v => v.status === 'Scheduled').length;
    document.getElementById('pendingVisits').textContent = pendingVisits;
    
    // Additional stats
    document.getElementById('emergencyCases').textContent = emergencyCases ? emergencyCases.filter(e => e.status === 'Active').length : 0;
    document.getElementById('totalStaff').textContent = staff ? staff.length : 0;
    document.getElementById('lowStockItems').textContent = inventory ? inventory.filter(item => item.quantity <= item.minStock).length : 0;
    document.getElementById('pendingNotifications').textContent = notifications ? notifications.filter(n => !n.read).length : 0;
    
    // Load charts and activities
    loadDashboardCharts();
    loadRecentActivities();
    loadAlertsReminders();
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}

function loadDashboardCharts() {
    // Visits Chart
    const visitsCtx = document.getElementById('visitsChart');
    if (visitsCtx) {
        const last7Days = [];
        const visitCounts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
            
            const dayVisits = visits.filter(v => new Date(v.date).toDateString() === dateStr).length;
            visitCounts.push(dayVisits);
        }
        
        if (visitsChart) {
            visitsChart.destroy();
        }
        visitsChart = new Chart(visitsCtx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Patient Visits',
                    data: visitCounts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Department Chart
    const deptCtx = document.getElementById('departmentChart');
    if (deptCtx && departments.length > 0) {
        const deptNames = departments.map(d => d.name);
        const deptCounts = departments.map(d => {
            return doctors.filter(doc => doc.department === d.name).length;
        });

        if (departmentChart) {
            departmentChart.destroy();
        }
        departmentChart = new Chart(deptCtx, {
            type: 'doughnut',
            data: {
                labels: deptNames,
                datasets: [{
                    data: deptCounts,
                    backgroundColor: [
                        '#667eea',
                        '#f093fb',
                        '#4facfe',
                        '#ff6b6b',
                        '#6c757d',
                        '#ffd700'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function loadRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    
    const activities = [];
    
    // Recent patients
    patients.slice(-3).forEach(patient => {
        activities.push({
            icon: 'fas fa-user-plus',
            color: '#667eea',
            text: `New patient registered: ${patient.name}`,
            time: getTimeAgo(new Date(patient.createdAt))
        });
    });
    
    // Recent visits
    visits.slice(-2).forEach(visit => {
        activities.push({
            icon: 'fas fa-calendar-check',
            color: '#28a745',
            text: `Visit scheduled for ${visit.patient}`,
            time: getTimeAgo(new Date(visit.createdAt))
        });
    });
    
    // Recent admissions
    admissions.slice(-2).forEach(admission => {
        activities.push({
            icon: 'fas fa-bed',
            color: '#ffc107',
            text: `Patient admitted: ${admission.patient}`,
            time: getTimeAgo(new Date(admission.createdAt))
        });
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background-color: ${activity.color}20; color: ${activity.color};">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div>${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No recent activities</p>';
    }
}

function loadAlertsReminders() {
    const container = document.getElementById('alertsReminders');
    if (!container) return;
    
    const alerts = [];
    
    // Low stock alerts
    if (inventory) {
        const lowStock = inventory.filter(item => item.quantity <= item.minStock);
        if (lowStock.length > 0) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                text: `${lowStock.length} items are running low on stock`,
                action: 'inventory'
            });
        }
    }
    
    // Emergency cases
    if (emergencyCases) {
        const activeEmergencies = emergencyCases.filter(e => e.status === 'Active');
        if (activeEmergencies.length > 0) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-ambulance',
                text: `${activeEmergencies.length} active emergency cases need attention`,
                action: 'emergency'
            });
        }
    }
    
    // Today's appointments
    const todayAppointments = appointments.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.date).toDateString() === today && a.status === 'Scheduled';
    });
    if (todayAppointments.length > 0) {
        alerts.push({
            type: 'info',
            icon: 'fas fa-calendar',
            text: `${todayAppointments.length} appointments scheduled for today`,
            action: 'appointments'
        });
    }
    
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item alert-${alert.type}" onclick="showSection('${alert.action}')" style="cursor: pointer;">
            <i class="${alert.icon} me-2"></i>
            ${alert.text}
        </div>
    `).join('');
    
    if (alerts.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No alerts at this time</p>';
    }
}

// Update time every minute
setInterval(updateDateTime, 60000);

// Patient Management
function loadPatientsTable() {
    const tbody = document.getElementById('patientsTable');
    tbody.innerHTML = '';
    
    const canEdit = canPerformCRUD('patients');
    
    patients.forEach((patient, index) => {
        const actions = canEdit ? `
            <div class="action-buttons">
                <button class="btn btn-sm btn-warning" onclick="editPatient(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePatient(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '<span class="text-muted">View Only</span>';
        
        const row = `
            <tr>
                <td>MRN-${String(index + 1).padStart(4, '0')}</td>
                <td>${patient.name}</td>
                <td>${patient.gender}</td>
                <td>${patient.age}</td>
                <td>${patient.phone}</td>
                <td>${patient.address}</td>
                <td>${actions}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function editPatient(index) {
    const patient = patients[index];
    if (patient) {
        document.querySelector('#patientForm input[name="name"]').value = patient.name;
        document.querySelector('#patientForm select[name="gender"]').value = patient.gender;
        document.querySelector('#patientForm input[name="age"]').value = patient.age;
        document.querySelector('#patientForm input[name="phone"]').value = patient.phone;
        document.querySelector('#patientForm textarea[name="address"]').value = patient.address;
        
        document.getElementById('patientForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('patientModal'));
        modal.show();
    }
}

function savePatient() {
    if (!canPerformCRUD('patients')) {
        alert('Access denied! You do not have permission to modify patients.');
        return;
    }

    const form = document.getElementById('patientForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');

    const patientData = {
        name: formData.get('name'),
        gender: formData.get('gender'),
        age: parseInt(formData.get('age')),
        phone: formData.get('phone'),
        address: formData.get('address')
    };

    (async () => {
        try {
            if (editIndex) {
                // Update
                const patientId = patients[editIndex].id;
                await apiRequest(`/patients/${patientId}`, {
                    method: 'PUT',
                    body: JSON.stringify(patientData)
                });
            } else {
                // Create
                await apiRequest('/patients', {
                    method: 'POST',
                    body: JSON.stringify(patientData)
                });
            }

            // Reload data
            await loadDataFromAPI();
            showSection('patients');
            updateDashboardStats();

            const modal = bootstrap.Modal.getInstance(document.getElementById('patientModal'));
            modal.hide();
            form.reset();
            form.removeAttribute('data-edit-index');

        } catch (error) {
            alert('Error saving patient: ' + error.message);
        }
    })();
}

function generatePatientReceipt(patient, mrn) {
    const receiptContent = `
        <div style="max-width: 400px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 14px;">Patient Registration Receipt</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                <p><strong>MRN:</strong> MRN-${String(mrn).padStart(4, '0')}</p>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #333;">Patient Details</h4>
                <p><strong>Name:</strong> ${patient.name}</p>
                <p><strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Age:</strong> ${patient.age} years</p>
                <p><strong>Phone:</strong> ${patient.phone}</p>
                <p><strong>Address:</strong> ${patient.address}</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #666;">
                <p>Thank you for choosing Gulzar Trust Hospital</p>
                <p>Please keep this receipt for your records</p>
            </div>
        </div>
    `;
    
    showReceipt(receiptContent, 'Patient Registration Receipt');
}

function deletePatient(index) {
    if (!canPerformCRUD('patients')) {
        alert('Access denied! You do not have permission to delete patients.');
        return;
    }

    if (confirm('Are you sure you want to delete this patient?')) {
        (async () => {
            try {
                const patientId = patients[index].id;
                await apiRequest(`/patients/${patientId}`, {
                    method: 'DELETE'
                });

                // Reload data
                await loadDataFromAPI();
                showSection('patients');
                updateDashboardStats();

            } catch (error) {
                alert('Error deleting patient: ' + error.message);
            }
        })();
    }
}

// Doctor Management
function loadDoctorsTable() {
    const tbody = document.getElementById('doctorsTable');
    tbody.innerHTML = '';
    
    const canEdit = canPerformCRUD('doctors');
    
    doctors.forEach((doctor, index) => {
        const actions = canEdit ? `
            <div class="action-buttons">
                <button class="btn btn-sm btn-warning" onclick="editDoctor(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '<span class="text-muted">View Only</span>';
        
        const row = `
            <tr>
                <td>${doctor.name}</td>
                <td>${doctor.specialization}</td>
                <td>${doctor.department}</td>
                <td>${doctor.roomNo}</td>
                <td>${actions}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function editDoctor(index) {
    const doctor = doctors[index];
    if (doctor) {
        document.querySelector('#doctorForm input[name="name"]').value = doctor.name;
        document.querySelector('#doctorForm input[name="specialization"]').value = doctor.specialization;
        document.querySelector('#doctorForm select[name="department"]').value = doctor.department;
        document.querySelector('#doctorForm input[name="roomNo"]').value = doctor.roomNo;
        
        document.getElementById('doctorForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('doctorModal'));
        modal.show();
    }
}

function saveDoctor() {
    const form = document.getElementById('doctorForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const doctor = {
        name: formData.get('name'),
        specialization: formData.get('specialization'),
        department: formData.get('department'),
        roomNo: formData.get('roomNo'),
        createdAt: editIndex ? doctors[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        doctors[editIndex] = doctor;
        form.removeAttribute('data-edit-index');
    } else {
        doctors.push(doctor);
    }
    
    localStorage.setItem('doctors', JSON.stringify(doctors));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('doctorModal'));
    modal.hide();
    form.reset();
    loadDoctorsTable();
    updateDashboardStats();
}

function deleteDoctor(index) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        doctors.splice(index, 1);
        localStorage.setItem('doctors', JSON.stringify(doctors));
        loadDoctorsTable();
        updateDashboardStats();
    }
}

// Department Management
function loadDepartmentsTable() {
    const tbody = document.getElementById('departmentsTable');
    tbody.innerHTML = '';
    
    departments.forEach((dept, index) => {
        const row = `
            <tr>
                <td>${dept.name}</td>
                <td>${dept.description}</td>
                <td>${dept.head}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editDepartment(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    // Update department dropdown in doctor form
    updateDepartmentDropdown();
}

function editDepartment(index) {
    const dept = departments[index];
    if (dept) {
        document.querySelector('#departmentForm input[name="name"]').value = dept.name;
        document.querySelector('#departmentForm textarea[name="description"]').value = dept.description;
        document.querySelector('#departmentForm input[name="head"]').value = dept.head;
        
        document.getElementById('departmentForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('departmentModal'));
        modal.show();
    }
}

function saveDepartment() {
    const form = document.getElementById('departmentForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const department = {
        name: formData.get('name'),
        description: formData.get('description'),
        head: formData.get('head'),
        createdAt: editIndex ? departments[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        departments[editIndex] = department;
        form.removeAttribute('data-edit-index');
    } else {
        departments.push(department);
    }
    
    localStorage.setItem('departments', JSON.stringify(departments));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('departmentModal'));
    modal.hide();
    form.reset();
    loadDepartmentsTable();
}

function deleteDepartment(index) {
    if (confirm('Are you sure you want to delete this department?')) {
        departments.splice(index, 1);
        localStorage.setItem('departments', JSON.stringify(departments));
        loadDepartmentsTable();
    }
}

function updateDepartmentDropdown() {
    const select = document.querySelector('#doctorForm select[name="department"]');
    select.innerHTML = '<option value="">Select Department</option>';
    
    departments.forEach(dept => {
        select.innerHTML += `<option value="${dept.name}">${dept.name}</option>`;
    });
}

// Visits Management
function loadVisitsTable() {
    const tbody = document.getElementById('visitsTable');
    tbody.innerHTML = '';
    
    visits.forEach((visit, index) => {
        const row = `
            <tr>
                <td>${visit.patient}</td>
                <td>${visit.doctor}</td>
                <td>${new Date(visit.date).toLocaleDateString()}</td>
                <td>${visit.time}</td>
                <td><span class="badge badge-${visit.status === 'Completed' ? 'success' : 'warning'}">${visit.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editVisit(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="completeVisit(${index})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVisit(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updatePatientDropdowns();
    updateDoctorDropdowns();
}

function saveVisit() {
    const form = document.getElementById('visitForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const visit = {
        patient: formData.get('patient'),
        doctor: formData.get('doctor'),
        date: formData.get('date'),
        time: formData.get('time'),
        status: formData.get('status'),
        createdAt: editIndex ? visits[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        visits[editIndex] = visit;
        form.removeAttribute('data-edit-index');
    } else {
        visits.push(visit);
        generateVisitReceipt(visit, visits.length);
    }
    
    localStorage.setItem('visits', JSON.stringify(visits));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('visitModal'));
    modal.hide();
    form.reset();
    loadVisitsTable();
    updateDashboardStats();
}

function generateVisitReceipt(visit, visitId) {
    const receiptContent = `
        <div style="max-width: 400px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 14px;">Visit Receipt</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Visit ID:</strong> VST-${String(visitId).padStart(4, '0')}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #333;">Visit Details</h4>
                <p><strong>Patient:</strong> ${visit.patient}</p>
                <p><strong>Doctor:</strong> ${visit.doctor}</p>
                <p><strong>Visit Date:</strong> ${new Date(visit.date).toLocaleDateString()}</p>
                <p><strong>Visit Time:</strong> ${visit.time}</p>
                <p><strong>Status:</strong> ${visit.status}</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #666;">
                <p>Thank you for choosing Gulzar Trust Hospital</p>
                <p>Please keep this receipt for your records</p>
            </div>
        </div>
    `;
    
    showReceipt(receiptContent, 'Visit Receipt');
}

function completeVisit(index) {
    visits[index].status = 'Completed';
    localStorage.setItem('visits', JSON.stringify(visits));
    loadVisitsTable();
}

function editVisit(index) {
    const visit = visits[index];
    if (visit) {
        document.querySelector('#visitForm input[name="patient"]').value = visit.patient;
        document.querySelector('#visitForm select[name="doctor"]').value = visit.doctor;
        document.querySelector('#visitForm input[name="date"]').value = visit.date.split('T')[0];
        document.querySelector('#visitForm input[name="time"]').value = visit.time;
        document.querySelector('#visitForm select[name="status"]').value = visit.status;
        
        document.getElementById('visitForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('visitModal'));
        modal.show();
    }
}

function editAdmission(index) {
    const admission = admissions[index];
    if (admission) {
        document.querySelector('#admissionForm select[name="patient"]').value = admission.patient;
        document.querySelector('#admissionForm select[name="ward"]').value = admission.ward;
        document.querySelector('#admissionForm select[name="bed"]').value = admission.bed;
        document.querySelector('#admissionForm input[name="admissionDate"]').value = admission.admissionDate.split('T')[0];
        document.querySelector('#admissionForm select[name="status"]').value = admission.status;
        
        document.getElementById('admissionForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('admissionModal'));
        modal.show();
    }
}

function editAppointment(index) {
    const appointment = appointments[index];
    if (appointment) {
        document.querySelector('#appointmentForm input[name="patient"]').value = appointment.patient;
        document.querySelector('#appointmentForm select[name="doctor"]').value = appointment.doctor;
        document.querySelector('#appointmentForm input[name="date"]').value = appointment.date.split('T')[0];
        document.querySelector('#appointmentForm input[name="time"]').value = appointment.time;
        document.querySelector('#appointmentForm select[name="type"]').value = appointment.type;
        document.querySelector('#appointmentForm textarea[name="notes"]').value = appointment.notes || '';
        
        document.getElementById('appointmentForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        modal.show();
    }
}

function editLabTest(index) {
    const test = labTests[index];
    if (test) {
        document.querySelector('#labTestForm select[name="patient"]').value = test.patient;
        document.querySelector('#labTestForm select[name="testType"]').value = test.testType;
        document.querySelector('#labTestForm input[name="testDate"]').value = test.testDate.split('T')[0];
        document.querySelector('#labTestForm select[name="status"]').value = test.status;
        document.querySelector('#labTestForm textarea[name="notes"]').value = test.notes || '';
        
        document.getElementById('labTestForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('labTestModal'));
        modal.show();
    }
}

function deleteVisit(index) {
    if (confirm('Are you sure you want to delete this visit?')) {
        visits.splice(index, 1);
        localStorage.setItem('visits', JSON.stringify(visits));
        loadVisitsTable();
        updateDashboardStats();
    }
}

function editBill(index) {
    const bill = bills[index];
    if (bill) {
        document.querySelector('#billForm select[name="patient"]').value = bill.patient;
        
        const container = document.getElementById('servicesContainer');
        container.innerHTML = '';
        
        bill.services.forEach((service, i) => {
            const newRow = document.createElement('div');
            newRow.className = 'row service-row mt-2';
            newRow.innerHTML = `
                <div class="col-md-6">
                    <input type="text" class="form-control" name="service[]" placeholder="Service Name" value="${service.name}">
                </div>
                <div class="col-md-4">
                    <input type="number" class="form-control" name="amount[]" placeholder="Amount" value="${service.amount}" onchange="calculateTotal()">
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger" onclick="removeService(this)">-</button>
                </div>
            `;
            container.appendChild(newRow);
        });
        
        calculateTotal();
        
        document.getElementById('billForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('billModal'));
        modal.show();
    }
}

// Admissions Management
function loadAdmissionsTable() {
    const tbody = document.getElementById('admissionsTable');
    tbody.innerHTML = '';
    
    admissions.forEach((admission, index) => {
        const row = `
            <tr>
                <td>${admission.patient}</td>
                <td>${admission.ward}</td>
                <td>${admission.bed}</td>
                <td>${new Date(admission.admissionDate).toLocaleDateString()}</td>
                <td><span class="badge badge-${admission.status === 'Active' ? 'success' : 'warning'}">${admission.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editAdmission(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="dischargePatient(${index})">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAdmission(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updatePatientDropdowns();
    updateWardDropdowns();
    updateBedDropdowns();
}

function saveAdmission() {
    const form = document.getElementById('admissionForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const admission = {
        patient: formData.get('patient'),
        ward: formData.get('ward'),
        bed: formData.get('bed'),
        admissionDate: formData.get('admissionDate'),
        status: formData.get('status'),
        createdAt: editIndex ? admissions[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        admissions[editIndex] = admission;
        form.removeAttribute('data-edit-index');
    } else {
        admissions.push(admission);
        
        // Update bed status
        const bedIndex = beds.findIndex(bed => bed.number === admission.bed);
        if (bedIndex !== -1) {
            beds[bedIndex].status = 'Occupied';
            beds[bedIndex].patient = admission.patient;
            localStorage.setItem('beds', JSON.stringify(beds));
        }
        
        generateAdmissionReceipt(admission);
    }
    
    localStorage.setItem('admissions', JSON.stringify(admissions));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('admissionModal'));
    modal.hide();
    form.reset();
    loadAdmissionsTable();
    updateDashboardStats();
}

function generateAdmissionReceipt(admission) {
    const receiptContent = `
        <div style="max-width: 400px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 14px;">Admission Receipt</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Admission Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Admission Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #333;">Admission Details</h4>
                <p><strong>Patient:</strong> ${admission.patient}</p>
                <p><strong>Ward:</strong> ${admission.ward}</p>
                <p><strong>Bed Number:</strong> ${admission.bed}</p>
                <p><strong>Scheduled Date:</strong> ${new Date(admission.admissionDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${admission.status}</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #666;">
                <p>Please bring necessary documents and insurance cards</p>
                <p>Thank you for choosing Gulzar Trust Hospital</p>
            </div>
        </div>
    `;
    
    showReceipt(receiptContent, 'Admission Receipt');
}

function dischargePatient(index) {
    if (confirm('Are you sure you want to discharge this patient?')) {
        const admission = admissions[index];
        admission.status = 'Discharged';
        
        // Free up the bed
        const bedIndex = beds.findIndex(bed => bed.number === admission.bed);
        if (bedIndex !== -1) {
            beds[bedIndex].status = 'Available';
            beds[bedIndex].patient = null;
            localStorage.setItem('beds', JSON.stringify(beds));
        }
        
        localStorage.setItem('admissions', JSON.stringify(admissions));
        loadAdmissionsTable();
        updateDashboardStats();
    }
}

function deleteAdmission(index) {
    if (confirm('Are you sure you want to delete this admission?')) {
        admissions.splice(index, 1);
        localStorage.setItem('admissions', JSON.stringify(admissions));
        loadAdmissionsTable();
        updateDashboardStats();
    }
}

// Wards Management
function loadWardsTable() {
    const tbody = document.getElementById('wardsTable');
    tbody.innerHTML = '';
    
    wards.forEach((ward, index) => {
        const availableBeds = beds.filter(bed => bed.ward === ward.name && bed.status === 'Available').length;
        const row = `
            <tr>
                <td>${ward.name}</td>
                <td>${ward.type}</td>
                <td>${ward.totalBeds}</td>
                <td>${availableBeds}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editWard(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteWard(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function editWard(index) {
    const ward = wards[index];
    if (ward) {
        document.querySelector('#wardForm input[name="name"]').value = ward.name;
        document.querySelector('#wardForm select[name="type"]').value = ward.type;
        document.querySelector('#wardForm input[name="totalBeds"]').value = ward.totalBeds;
        
        document.getElementById('wardForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('wardModal'));
        modal.show();
    }
}

function saveWard() {
    const form = document.getElementById('wardForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const ward = {
        name: formData.get('name'),
        type: formData.get('type'),
        totalBeds: parseInt(formData.get('totalBeds')),
        createdAt: editIndex ? wards[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        wards[editIndex] = ward;
        form.removeAttribute('data-edit-index');
    } else {
        wards.push(ward);
    }
    
    localStorage.setItem('wards', JSON.stringify(wards));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('wardModal'));
    modal.hide();
    form.reset();
    loadWardsTable();
}

function deleteWard(index) {
    if (confirm('Are you sure you want to delete this ward?')) {
        wards.splice(index, 1);
        localStorage.setItem('wards', JSON.stringify(wards));
        loadWardsTable();
    }
}

// Beds Management
function loadBedsTable() {
    const tbody = document.getElementById('bedsTable');
    tbody.innerHTML = '';
    
    beds.forEach((bed, index) => {
        const row = `
            <tr>
                <td>${bed.number}</td>
                <td>${bed.ward}</td>
                <td>${bed.type}</td>
                <td><span class="status-${bed.status.toLowerCase()}">${bed.status}</span></td>
                <td>${bed.patient || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editBed(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBed(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function editBed(index) {
    const bed = beds[index];
    if (bed) {
        document.querySelector('#bedForm input[name="bedNumber"]').value = bed.number;
        document.querySelector('#bedForm select[name="ward"]').value = bed.ward;
        document.querySelector('#bedForm select[name="type"]').value = bed.type;
        document.querySelector('#bedForm select[name="status"]').value = bed.status;
        
        document.getElementById('bedForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('bedModal'));
        modal.show();
    }
}

function saveBed() {
    const form = document.getElementById('bedForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const bed = {
        number: formData.get('bedNumber'),
        ward: formData.get('ward'),
        type: formData.get('type'),
        status: formData.get('status'),
        patient: editIndex ? beds[editIndex].patient : null,
        createdAt: editIndex ? beds[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        beds[editIndex] = bed;
        form.removeAttribute('data-edit-index');
    } else {
        beds.push(bed);
    }
    
    localStorage.setItem('beds', JSON.stringify(beds));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('bedModal'));
    modal.hide();
    form.reset();
    loadBedsTable();
}

function deleteBed(index) {
    if (confirm('Are you sure you want to delete this bed?')) {
        beds.splice(index, 1);
        localStorage.setItem('beds', JSON.stringify(beds));
        loadBedsTable();
    }
}

// Appointments Management
function loadAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTable');
    tbody.innerHTML = '';
    
    appointments.forEach((appointment, index) => {
        const row = `
            <tr>
                <td>${appointment.patient}</td>
                <td>${appointment.doctor}</td>
                <td>${new Date(appointment.date).toLocaleDateString()}</td>
                <td>${appointment.time}</td>
                <td>${appointment.type}</td>
                <td><span class="badge badge-info">${appointment.status || 'Scheduled'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editAppointment(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="completeAppointment(${index})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updateDoctorDropdowns();
}

function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const appointment = {
        patient: formData.get('patient'),
        doctor: formData.get('doctor'),
        date: formData.get('date'),
        time: formData.get('time'),
        type: formData.get('type'),
        notes: formData.get('notes'),
        status: editIndex ? appointments[editIndex].status : 'Scheduled',
        createdAt: editIndex ? appointments[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        appointments[editIndex] = appointment;
        form.removeAttribute('data-edit-index');
    } else {
        appointments.push(appointment);
        generateAppointmentReceipt(appointment, appointments.length);
    }
    
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
    modal.hide();
    form.reset();
    loadAppointmentsTable();
}

function generateAppointmentReceipt(appointment, appointmentId) {
    const receiptContent = `
        <div style="max-width: 400px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 14px;">Appointment Confirmation</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Appointment ID:</strong> APT-${String(appointmentId).padStart(4, '0')}</p>
                <p><strong>Booking Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Booking Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #333;">Appointment Details</h4>
                <p><strong>Patient:</strong> ${appointment.patient}</p>
                <p><strong>Doctor:</strong> ${appointment.doctor}</p>
                <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Type:</strong> ${appointment.type}</p>
                <p><strong>Status:</strong> ${appointment.status}</p>
                ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #666;">
                <p>Please arrive 15 minutes before your appointment</p>
                <p>Thank you for choosing Gulzar Trust Hospital</p>
            </div>
        </div>
    `;
    
    showReceipt(receiptContent, 'Appointment Confirmation');
}

function completeAppointment(index) {
    appointments[index].status = 'Completed';
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointmentsTable();
}

function deleteAppointment(index) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        appointments.splice(index, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        loadAppointmentsTable();
    }
}

// Billing Management
function loadBillingTable() {
    const tbody = document.getElementById('billingTable');
    tbody.innerHTML = '';
    
    bills.forEach((bill, index) => {
        const row = `
            <tr>
                <td>BILL-${String(index + 1).padStart(4, '0')}</td>
                <td>${bill.patient}</td>
                <td>$${bill.totalAmount}</td>
                <td>${new Date(bill.date).toLocaleDateString()}</td>
                <td><span class="badge badge-${bill.status === 'Paid' ? 'success' : 'warning'}">${bill.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editBill(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="markPaid(${index})">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="printBill(${index})">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBill(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updatePatientDropdowns();
}

function saveBill() {
    const form = document.getElementById('billForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const services = [];
    const serviceNames = formData.getAll('service[]');
    const amounts = formData.getAll('amount[]');
    
    for (let i = 0; i < serviceNames.length; i++) {
        if (serviceNames[i] && amounts[i]) {
            services.push({
                name: serviceNames[i],
                amount: parseFloat(amounts[i])
            });
        }
    }
    
    const totalAmount = services.reduce((sum, service) => sum + service.amount, 0);
    
    const bill = {
        patient: formData.get('patient'),
        services: services,
        totalAmount: totalAmount,
        date: editIndex ? bills[editIndex].date : new Date().toISOString(),
        status: editIndex ? bills[editIndex].status : 'Pending',
        createdAt: editIndex ? bills[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        bills[editIndex] = bill;
        form.removeAttribute('data-edit-index');
    } else {
        bills.push(bill);
        generateBillReceipt(bill, bills.length);
    }
    
    localStorage.setItem('bills', JSON.stringify(bills));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('billModal'));
    modal.hide();
    form.reset();
    loadBillingTable();
}

function generateBillReceipt(bill, billId) {
    const receiptContent = `
        <div style="max-width: 400px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 14px;">Medical Bill Receipt</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Bill ID:</strong> BILL-${String(billId).padStart(4, '0')}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                <p><strong>Patient:</strong> ${bill.patient}</p>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #333;">Services</h4>
                ${bill.services.map(service => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${service.name}</span>
                        <span>$${service.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
                <hr style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
                    <span>Total Amount:</span>
                    <span>$${bill.totalAmount.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #666;">
                <p>Status: ${bill.status}</p>
                <p>Thank you for choosing Gulzar Trust Hospital</p>
                <p>Please keep this receipt for your records</p>
            </div>
        </div>
    `;
    
    showReceipt(receiptContent, 'Medical Bill Receipt');
}

function addService() {
    const container = document.getElementById('servicesContainer');
    const newRow = document.createElement('div');
    newRow.className = 'row service-row mt-2';
    newRow.innerHTML = `
        <div class="col-md-6">
            <input type="text" class="form-control" name="service[]" placeholder="Service Name">
        </div>
        <div class="col-md-4">
            <input type="number" class="form-control" name="amount[]" placeholder="Amount" onchange="calculateTotal()">
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger" onclick="removeService(this)">-</button>
        </div>
    `;
    container.appendChild(newRow);
}

function removeService(button) {
    button.closest('.service-row').remove();
    calculateTotal();
}

function calculateTotal() {
    const amounts = document.querySelectorAll('input[name="amount[]"]');
    let total = 0;
    amounts.forEach(input => {
        if (input.value) {
            total += parseFloat(input.value);
        }
    });
    document.querySelector('input[name="totalAmount"]').value = total.toFixed(2);
}

function markPaid(index) {
    bills[index].status = 'Paid';
    bills[index].paidDate = new Date().toISOString();
    localStorage.setItem('bills', JSON.stringify(bills));
    loadBillingTable();
}

function printBill(index) {
    const bill = bills[index];
    alert(`Bill for ${bill.patient}\nTotal: $${bill.totalAmount}\nStatus: ${bill.status}`);
}

function deleteBill(index) {
    if (confirm('Are you sure you want to delete this bill?')) {
        bills.splice(index, 1);
        localStorage.setItem('bills', JSON.stringify(bills));
        loadBillingTable();
    }
}

// Pharmacy Management
function loadPharmacyTable() {
    const tbody = document.getElementById('pharmacyTable');
    tbody.innerHTML = '';
    
    medicines.forEach((medicine, index) => {
        const isExpired = new Date(medicine.expiry) < new Date();
        const row = `
            <tr class="${isExpired ? 'table-danger' : ''}">
                <td>${medicine.name}</td>
                <td>${medicine.category}</td>
                <td>${medicine.stock}</td>
                <td>$${medicine.price}</td>
                <td>${new Date(medicine.expiry).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editMedicine(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function editMedicine(index) {
    const medicine = medicines[index];
    if (medicine) {
        document.querySelector('#medicineForm input[name="name"]').value = medicine.name;
        document.querySelector('#medicineForm select[name="category"]').value = medicine.category;
        document.querySelector('#medicineForm input[name="stock"]').value = medicine.stock;
        document.querySelector('#medicineForm input[name="price"]').value = medicine.price;
        document.querySelector('#medicineForm input[name="expiry"]').value = medicine.expiry;
        
        document.getElementById('medicineForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('medicineModal'));
        modal.show();
    }
}

function saveMedicine() {
    const form = document.getElementById('medicineForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const medicine = {
        name: formData.get('name'),
        category: formData.get('category'),
        stock: parseInt(formData.get('stock')),
        price: parseFloat(formData.get('price')),
        expiry: formData.get('expiry'),
        createdAt: editIndex ? medicines[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        medicines[editIndex] = medicine;
        form.removeAttribute('data-edit-index');
    } else {
        medicines.push(medicine);
    }
    
    localStorage.setItem('medicines', JSON.stringify(medicines));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('medicineModal'));
    modal.hide();
    form.reset();
    loadPharmacyTable();
}

function deleteMedicine(index) {
    if (confirm('Are you sure you want to delete this medicine?')) {
        medicines.splice(index, 1);
        localStorage.setItem('medicines', JSON.stringify(medicines));
        loadPharmacyTable();
    }
}

// Laboratory Management
function loadLabTable() {
    const tbody = document.getElementById('labTable');
    tbody.innerHTML = '';
    
    labTests.forEach((test, index) => {
        const row = `
            <tr>
                <td>LAB-${String(index + 1).padStart(4, '0')}</td>
                <td>${test.patient}</td>
                <td>${test.testType}</td>
                <td>${new Date(test.testDate).toLocaleDateString()}</td>
                <td><span class="badge badge-${test.status === 'Completed' ? 'success' : 'warning'}">${test.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editLabTest(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="completeLabTest(${index})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="viewResults(${index})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLabTest(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updatePatientDropdowns();
}

function saveLabTest() {
    const form = document.getElementById('labTestForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const labTest = {
        patient: formData.get('patient'),
        testType: formData.get('testType'),
        testDate: formData.get('testDate'),
        status: formData.get('status'),
        notes: formData.get('notes'),
        createdAt: editIndex ? labTests[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        labTests[editIndex] = labTest;
        form.removeAttribute('data-edit-index');
    } else {
        labTests.push(labTest);
    }
    
    localStorage.setItem('labTests', JSON.stringify(labTests));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('labTestModal'));
    modal.hide();
    form.reset();
    loadLabTable();
}

function completeLabTest(index) {
    labTests[index].status = 'Completed';
    labTests[index].completedDate = new Date().toISOString();
    localStorage.setItem('labTests', JSON.stringify(labTests));
    loadLabTable();
}

function viewResults(index) {
    const test = labTests[index];
    if (test.status === 'Completed') {
        generateLabReport(test, index + 1);
    } else {
        alert('Test is not completed yet. Results not available.');
    }
}

function generateLabReport(test, testId) {
    const reportImages = {
        'Blood Test': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJsb29kIFRlc3QgUmVzdWx0PC90ZXh0Pjwvc3ZnPg==',
        'Urine Test': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmNGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFuYWx5c2lzIFJlcG9ydDwvdGV4dD48L3N2Zz4=',
        'X-Ray': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoZXN0IFgtUmF5PC90ZXh0Pjwvc3ZnPg==',
        'CT Scan': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNUIFNjYW4gSW1hZ2U8L3RleHQ+PC9zdmc+',
        'MRI': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1SSSBTY2FuPC90ZXh0Pjwvc3ZnPg=='
    };
    
    const reportDetails = {
        'Blood Test': {
            parameters: [
                { name: 'Hemoglobin', value: '12.5 g/dL', range: '12.0-15.5 g/dL', status: 'Normal' },
                { name: 'WBC Count', value: '7,200/μL', range: '4,000-11,000/μL', status: 'Normal' },
                { name: 'Platelet Count', value: '250,000/μL', range: '150,000-450,000/μL', status: 'Normal' },
                { name: 'Blood Sugar', value: '95 mg/dL', range: '70-100 mg/dL', status: 'Normal' }
            ]
        },
        'Urine Test': {
            parameters: [
                { name: 'Color', value: 'Yellow', range: 'Pale Yellow', status: 'Normal' },
                { name: 'Protein', value: 'Negative', range: 'Negative', status: 'Normal' },
                { name: 'Glucose', value: 'Negative', range: 'Negative', status: 'Normal' },
                { name: 'Specific Gravity', value: '1.020', range: '1.003-1.030', status: 'Normal' }
            ]
        },
        'X-Ray': {
            parameters: [
                { name: 'Heart Size', value: 'Normal', range: 'Normal', status: 'Normal' },
                { name: 'Lung Fields', value: 'Clear', range: 'Clear', status: 'Normal' },
                { name: 'Bone Structure', value: 'Intact', range: 'Intact', status: 'Normal' }
            ]
        },
        'CT Scan': {
            parameters: [
                { name: 'Brain Structure', value: 'Normal', range: 'Normal', status: 'Normal' },
                { name: 'Ventricles', value: 'Normal Size', range: 'Normal', status: 'Normal' },
                { name: 'No Abnormalities', value: 'Confirmed', range: 'Normal', status: 'Normal' }
            ]
        },
        'MRI': {
            parameters: [
                { name: 'Tissue Contrast', value: 'Normal', range: 'Normal', status: 'Normal' },
                { name: 'Signal Intensity', value: 'Normal', range: 'Normal', status: 'Normal' },
                { name: 'Anatomical Structure', value: 'Intact', range: 'Normal', status: 'Normal' }
            ]
        }
    };
    
    const details = reportDetails[test.testType] || { parameters: [] };
    const image = reportImages[test.testType] || reportImages['Blood Test'];
    
    const reportContent = `
        <div style="max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">Laboratory Test Report</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">Accredited Medical Laboratory</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <p><strong>Report ID:</strong> LAB-${String(testId).padStart(4, '0')}</p>
                    <p><strong>Patient:</strong> ${test.patient}</p>
                    <p><strong>Test Type:</strong> ${test.testType}</p>
                </div>
                <div>
                    <p><strong>Test Date:</strong> ${new Date(test.testDate).toLocaleDateString()}</p>
                    <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${test.status}</span></p>
                </div>
            </div>
            
            <div style="margin-bottom: 25px; text-align: center;">
                <h4 style="color: #333; margin-bottom: 15px;">Test Image/Scan</h4>
                <img src="${image}" alt="${test.testType} Result" style="max-width: 300px; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            </div>
            
            <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
                <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Test Results & Analysis</h4>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Parameter</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Result</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Reference Range</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.parameters.map(param => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${param.name}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${param.value}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${param.range}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">
                                    <span style="color: ${param.status === 'Normal' ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                        ${param.status}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h5 style="margin-top: 0; color: #333;">Clinical Notes:</h5>
                <p style="margin: 5px 0; color: #555;">${test.notes || 'All parameters are within normal limits. No immediate concerns noted.'}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Recommendation:</strong> Continue regular health monitoring. Consult physician if symptoms persist.</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px;">
                <p><strong>Verified by:</strong> Dr. Lab Technician | <strong>License:</strong> LAB-2024-001</p>
                <p>This report is computer generated and does not require signature</p>
                <p>For queries, contact: lab@gulzarhospital.com | Phone: +92-300-1234567</p>
            </div>
        </div>
    `;
    
    showReceipt(reportContent, `${test.testType} Report - ${test.patient}`);
}

function deleteLabTest(index) {
    if (confirm('Are you sure you want to delete this lab test?')) {
        labTests.splice(index, 1);
        localStorage.setItem('labTests', JSON.stringify(labTests));
        loadLabTable();
    }
}

// Reports Management
function loadReports() {
    console.log('Loading reports and analytics...');
    // Initialize charts if needed
    initializeCharts();
}

// Report Generation Functions
function generatePatientReport() {
    const reportData = {
        totalPatients: patients.length,
        malePatients: patients.filter(p => p.gender === 'Male').length,
        femalePatients: patients.filter(p => p.gender === 'Female').length,
        ageGroups: {
            '0-18': patients.filter(p => p.age <= 18).length,
            '19-40': patients.filter(p => p.age >= 19 && p.age <= 40).length,
            '41-60': patients.filter(p => p.age >= 41 && p.age <= 60).length,
            '60+': patients.filter(p => p.age > 60).length
        }
    };
    
    const reportContent = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 16px;">Patient Statistics Report</p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Overall Statistics</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <h5 style="margin: 0; color: #007bff;">Total Patients</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${reportData.totalPatients}</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <h5 style="margin: 0; color: #28a745;">Active Admissions</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${admissions.filter(a => a.status === 'Active').length}</p>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Gender Distribution</h4>
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Male Patients:</span>
                        <span style="font-weight: bold;">${reportData.malePatients} (${((reportData.malePatients/reportData.totalPatients)*100).toFixed(1)}%)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Female Patients:</span>
                        <span style="font-weight: bold;">${reportData.femalePatients} (${((reportData.femalePatients/reportData.totalPatients)*100).toFixed(1)}%)</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Age Distribution</h4>
                <div style="margin-top: 15px;">
                    ${Object.entries(reportData.ageGroups).map(([range, count]) => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>${range} years:</span>
                            <span style="font-weight: bold;">${count} patients</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    showReceipt(reportContent, 'Patient Statistics Report');
}

function generateRevenueReport() {
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const paidBills = bills.filter(b => b.status === 'Paid');
    const pendingBills = bills.filter(b => b.status === 'Pending');
    const paidRevenue = paidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const pendingRevenue = pendingBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    const reportContent = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 16px;">Revenue Report</p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Revenue Summary</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
                        <h5 style="margin: 0; color: #155724;">Total Revenue</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #155724;">$${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8;">
                        <h5 style="margin: 0; color: #0c5460;">Total Bills</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #0c5460;">${bills.length}</p>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Payment Status</h4>
                <div style="margin-top: 15px;">
                    <div style="background: #d4edda; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #155724;">Paid Bills (${paidBills.length}):</span>
                            <span style="font-weight: bold; color: #155724;">$${paidRevenue.toFixed(2)}</span>
                        </div>
                    </div>
                    <div style="background: #fff3cd; padding: 10px; border-radius: 5px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #856404;">Pending Bills (${pendingBills.length}):</span>
                            <span style="font-weight: bold; color: #856404;">$${pendingRevenue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Recent Bills</h4>
                <div style="margin-top: 15px;">
                    ${bills.slice(-5).map((bill, index) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee;">
                            <div>
                                <span style="font-weight: bold;">${bill.patient}</span><br>
                                <small style="color: #666;">${new Date(bill.date).toLocaleDateString()}</small>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-weight: bold;">$${bill.totalAmount.toFixed(2)}</span><br>
                                <small class="badge badge-${bill.status === 'Paid' ? 'success' : 'warning'}">${bill.status}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    showReceipt(reportContent, 'Revenue Report');
}

function generateDoctorReport() {
    const doctorStats = doctors.map(doctor => {
        const doctorVisits = visits.filter(v => v.doctor === doctor.name);
        const doctorAppointments = appointments.filter(a => a.doctor === doctor.name);
        return {
            ...doctor,
            totalVisits: doctorVisits.length,
            totalAppointments: doctorAppointments.length,
            completedVisits: doctorVisits.filter(v => v.status === 'Completed').length
        };
    });
    
    const reportContent = `
        <div style="max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 16px;">Doctor Performance Report</p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Overview</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
                        <h5 style="margin: 0; color: #007bff;">Total Doctors</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${doctors.length}</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
                        <h5 style="margin: 0; color: #28a745;">Total Visits</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${visits.length}</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
                        <h5 style="margin: 0; color: #17a2b8;">Total Appointments</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${appointments.length}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Doctor Statistics</h4>
                <div style="margin-top: 15px;">
                    ${doctorStats.map(doctor => `
                        <div style="background: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h5 style="margin: 0; color: #333;">${doctor.name}</h5>
                                    <p style="margin: 5px 0; color: #666;">${doctor.specialization} - ${doctor.department}</p>
                                    <small style="color: #666;">Room: ${doctor.roomNo}</small>
                                </div>
                                <div style="text-align: right;">
                                    <div style="margin-bottom: 5px;">
                                        <span style="font-size: 12px; color: #666;">Visits:</span>
                                        <span style="font-weight: bold; color: #007bff;">${doctor.totalVisits}</span>
                                    </div>
                                    <div style="margin-bottom: 5px;">
                                        <span style="font-size: 12px; color: #666;">Appointments:</span>
                                        <span style="font-weight: bold; color: #28a745;">${doctor.totalAppointments}</span>
                                    </div>
                                    <div>
                                        <span style="font-size: 12px; color: #666;">Completed:</span>
                                        <span style="font-weight: bold; color: #17a2b8;">${doctor.completedVisits}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    showReceipt(reportContent, 'Doctor Performance Report');
}

function generateDepartmentReport() {
    const departmentStats = departments.map(dept => {
        const deptDoctors = doctors.filter(d => d.department === dept.name);
        const deptVisits = visits.filter(v => {
            const doctor = doctors.find(d => d.name === v.doctor);
            return doctor && doctor.department === dept.name;
        });
        return {
            ...dept,
            doctorCount: deptDoctors.length,
            totalVisits: deptVisits.length,
            doctors: deptDoctors
        };
    });
    
    const reportContent = `
        <div style="max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;"><i class="fas fa-hospital"></i> Gulzar Trust Hospital</h3>
                <p style="margin: 5px 0; font-size: 16px;">Department Report</p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Department Overview</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
                        <h5 style="margin: 0; color: #007bff;">Total Departments</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${departments.length}</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
                        <h5 style="margin: 0; color: #28a745;">Total Doctors</h5>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${doctors.length}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Department Details</h4>
                <div style="margin-top: 15px;">
                    ${departmentStats.map(dept => `
                        <div style="background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
                            <div style="margin-bottom: 15px;">
                                <h5 style="margin: 0; color: #333;">${dept.name}</h5>
                                <p style="margin: 5px 0; color: #666;">${dept.description}</p>
                                <p style="margin: 5px 0;"><strong>Head:</strong> ${dept.head}</p>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                                <div style="background: white; padding: 10px; border-radius: 3px; text-align: center;">
                                    <span style="font-size: 12px; color: #666;">Doctors</span><br>
                                    <span style="font-size: 18px; font-weight: bold; color: #007bff;">${dept.doctorCount}</span>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 3px; text-align: center;">
                                    <span style="font-size: 12px; color: #666;">Total Visits</span><br>
                                    <span style="font-size: 18px; font-weight: bold; color: #28a745;">${dept.totalVisits}</span>
                                </div>
                            </div>
                            
                            ${dept.doctors.length > 0 ? `
                                <div>
                                    <h6 style="margin: 10px 0 5px 0; color: #333;">Department Doctors:</h6>
                                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                        ${dept.doctors.map(doctor => `
                                            <span style="background: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; color: #666;">
                                                ${doctor.name} (${doctor.specialization})
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : '<p style="color: #666; font-style: italic;">No doctors assigned</p>'}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    showReceipt(reportContent, 'Department Report');
}

function initializeCharts() {
    // Simple chart initialization - you can enhance this with Chart.js or other libraries
    console.log('Charts initialized');
}

// Utility Functions
function updatePatientDropdowns() {
    const selects = document.querySelectorAll('select[name="patient"]');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Patient</option>';
        patients.forEach(patient => {
            select.innerHTML += `<option value="${patient.name}">${patient.name}</option>`;
        });
    });
}

function updateDoctorDropdowns() {
    const selects = document.querySelectorAll('select[name="doctor"]');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Doctor</option>';
        doctors.forEach(doctor => {
            select.innerHTML += `<option value="${doctor.name}">${doctor.name}</option>`;
        });
    });
}

function updateWardDropdowns() {
    const selects = document.querySelectorAll('select[name="ward"]');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Ward</option>';
        wards.forEach(ward => {
            select.innerHTML += `<option value="${ward.name}">${ward.name}</option>`;
        });
    });
}

function updateBedDropdowns() {
    const selects = document.querySelectorAll('select[name="bed"]');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Bed</option>';
        beds.filter(bed => bed.status === 'Available').forEach(bed => {
            select.innerHTML += `<option value="${bed.number}">${bed.number} (${bed.ward})</option>`;
        });
    });
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        document.querySelectorAll('.admin-only').forEach(element => {
            element.style.display = 'none';
        });
        
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }
}

// Load sample data
function loadSampleData() {
    // Load from localStorage or create sample data
    patients = JSON.parse(localStorage.getItem('patients')) || [
        { name: 'John Doe', gender: 'Male', age: 45, phone: '123-456-7890', address: '123 Main St', createdAt: new Date().toISOString() },
        { name: 'Jane Smith', gender: 'Female', age: 32, phone: '098-765-4321', address: '456 Oak Ave', createdAt: new Date().toISOString() }
    ];
    
    departments = JSON.parse(localStorage.getItem('departments')) || [
        { name: 'Cardiology', description: 'Heart and cardiovascular diseases', head: 'Dr. Smith', createdAt: new Date().toISOString() },
        { name: 'Neurology', description: 'Brain and nervous system disorders', head: 'Dr. Johnson', createdAt: new Date().toISOString() },
        { name: 'Orthopedics', description: 'Bone and joint treatments', head: 'Dr. Brown', createdAt: new Date().toISOString() }
    ];
    
    doctors = JSON.parse(localStorage.getItem('doctors')) || [
        { name: 'Dr. Smith', specialization: 'Cardiologist', department: 'Cardiology', roomNo: '101', createdAt: new Date().toISOString() },
        { name: 'Dr. Johnson', specialization: 'Neurologist', department: 'Neurology', roomNo: '201', createdAt: new Date().toISOString() }
    ];
    
    wards = JSON.parse(localStorage.getItem('wards')) || [
        { name: 'General Ward A', type: 'General', totalBeds: 20, createdAt: new Date().toISOString() },
        { name: 'ICU', type: 'Intensive Care', totalBeds: 10, createdAt: new Date().toISOString() }
    ];
    
    beds = JSON.parse(localStorage.getItem('beds')) || [
        { number: 'A001', ward: 'General Ward A', type: 'Standard', status: 'Available', patient: null, createdAt: new Date().toISOString() },
        { number: 'A002', ward: 'General Ward A', type: 'Standard', status: 'Occupied', patient: 'John Doe', createdAt: new Date().toISOString() },
        { number: 'ICU001', ward: 'ICU', type: 'ICU', status: 'Available', patient: null, createdAt: new Date().toISOString() }
    ];
    
    visits = JSON.parse(localStorage.getItem('visits')) || [
        { patient: 'John Doe', doctor: 'Dr. Smith', date: new Date().toISOString(), time: '10:00', status: 'Scheduled', createdAt: new Date().toISOString() },
        { patient: 'Jane Smith', doctor: 'Dr. Johnson', date: new Date().toISOString(), time: '14:00', status: 'Completed', createdAt: new Date().toISOString() }
    ];
    
    admissions = JSON.parse(localStorage.getItem('admissions')) || [
        { patient: 'John Doe', ward: 'General Ward A', bed: 'A002', admissionDate: new Date().toISOString(), status: 'Active', createdAt: new Date().toISOString() }
    ];
    
    appointments = JSON.parse(localStorage.getItem('appointments')) || [
        { patient: 'John Doe', doctor: 'Dr. Smith', date: new Date().toISOString(), time: '10:00', type: 'Consultation', status: 'Scheduled', createdAt: new Date().toISOString() },
        { patient: 'Jane Smith', doctor: 'Dr. Johnson', date: new Date().toISOString(), time: '14:00', type: 'Follow-up', status: 'Scheduled', createdAt: new Date().toISOString() }
    ];
    
    bills = JSON.parse(localStorage.getItem('bills')) || [
        { patient: 'John Doe', services: [{name: 'Consultation', amount: 100}, {name: 'X-Ray', amount: 50}], totalAmount: 150, date: new Date().toISOString(), status: 'Pending', createdAt: new Date().toISOString() }
    ];
    
    medicines = JSON.parse(localStorage.getItem('medicines')) || [
        { name: 'Paracetamol', category: 'Tablet', stock: 100, price: 5.00, expiry: '2025-12-31', createdAt: new Date().toISOString() },
        { name: 'Amoxicillin', category: 'Capsule', stock: 50, price: 15.00, expiry: '2025-06-30', createdAt: new Date().toISOString() }
    ];
    
    labTests = JSON.parse(localStorage.getItem('labTests')) || [
        { patient: 'John Doe', testType: 'Blood Test', testDate: new Date().toISOString(), status: 'Pending', notes: 'Routine checkup', createdAt: new Date().toISOString() },
        { patient: 'Jane Smith', testType: 'X-Ray', testDate: new Date().toISOString(), status: 'Completed', notes: 'Chest X-Ray', createdAt: new Date().toISOString() }
    ];
    
    // Save to localStorage
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('departments', JSON.stringify(departments));
    localStorage.setItem('doctors', JSON.stringify(doctors));
    localStorage.setItem('wards', JSON.stringify(wards));
    localStorage.setItem('beds', JSON.stringify(beds));
    localStorage.setItem('visits', JSON.stringify(visits));
    localStorage.setItem('admissions', JSON.stringify(admissions));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('medicines', JSON.stringify(medicines));
    localStorage.setItem('labTests', JSON.stringify(labTests));
}

// Event listeners for form calculations
document.addEventListener('input', function(e) {
    if (e.target.name === 'amount[]') {
        calculateTotal();
    }
});

// Receipt functions
function showReceipt(content, title) {
    const receiptModal = `
        <div class="modal fade" id="receiptModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="printReceipt()">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing receipt modal
    const existingModal = document.getElementById('receiptModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new receipt modal
    document.body.insertAdjacentHTML('beforeend', receiptModal);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('receiptModal'));
    modal.show();
}

function printReceipt() {
    const receiptContent = document.querySelector('#receiptModal .modal-body').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Additional data storage for new features (now fetched from API)

// Admin Panel - User Management
function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach((user, index) => {
        const row = `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge bg-primary">${user.role}</span></td>
                <td>${user.department || 'N/A'}</td>
                <td><span class="badge bg-success">${user.status || 'Active'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editUser(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    // Update department dropdown in add user form
    updateUserDepartmentDropdown();
}

function updateUserDepartmentDropdown() {
    const select = document.querySelector('#addUserForm select[name="department"]');
    if (select) {
        select.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            select.innerHTML += `<option value="${dept.name}">${dept.name}</option>`;
        });
    }
}

function editUser(index) {
    const user = users[index];
    if (user) {
        document.querySelector('#addUserForm input[name="name"]').value = user.name;
        document.querySelector('#addUserForm input[name="email"]').value = user.email;
        document.querySelector('#addUserForm input[name="password"]').value = user.password;
        document.querySelector('#addUserForm select[name="role"]').value = user.role;
        document.querySelector('#addUserForm select[name="department"]').value = user.department || '';
        
        // Set permissions checkboxes
        document.querySelectorAll('#addUserForm input[name="permissions"]').forEach(checkbox => {
            checkbox.checked = user.permissions.includes(checkbox.value);
        });
        
        document.getElementById('addUserForm').setAttribute('data-edit-index', index);
        document.querySelector('#addUserModal .modal-title').textContent = 'Edit User';
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
    }
}

function saveUser() {
    if (!canPerformCRUD('admin')) {
        alert('Access denied! You do not have permission to modify users.');
        return;
    }
    
    const form = document.getElementById('addUserForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    const permissions = Array.from(form.querySelectorAll('input[name="permissions"]:checked')).map(cb => cb.value);
    
    const newUser = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        department: formData.get('department'),
        status: 'Active',
        permissions: permissions,
        createdAt: editIndex ? users[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        users[editIndex] = newUser;
        form.removeAttribute('data-edit-index');
        document.querySelector('#addUserModal .modal-title').textContent = 'Add New User';
    } else {
        users.push(newUser);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    if (modal) modal.hide();
    form.reset();
    
    loadUsersTable();
    alert(editIndex ? 'User updated successfully!' : 'User added successfully!');
}

function deleteUser(index) {
    if (!canPerformCRUD('admin')) {
        alert('Access denied! You do not have permission to delete users.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsersTable();
        alert('User deleted successfully!');
    }
}

// Inventory Management
function loadInventoryTable() {
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';
    
    inventory.forEach((item, index) => {
        const status = item.quantity <= item.minStock ? 'Low Stock' : 'In Stock';
        const statusClass = item.quantity <= item.minStock ? 'text-danger' : 'text-success';
        const row = `
            <tr>
                <td>INV-${String(index + 1).padStart(4, '0')}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.minStock}</td>
                <td><span class="${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editInventoryItem(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function editInventoryItem(index) {
    const item = inventory[index];
    if (item) {
        document.querySelector('#inventoryForm input[name="name"]').value = item.name;
        document.querySelector('#inventoryForm select[name="category"]').value = item.category;
        document.querySelector('#inventoryForm input[name="quantity"]').value = item.quantity;
        document.querySelector('#inventoryForm input[name="minStock"]').value = item.minStock;
        
        document.getElementById('inventoryForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
        modal.show();
    }
}

function saveInventoryItem() {
    const form = document.getElementById('inventoryForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const item = {
        name: formData.get('name'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        minStock: parseInt(formData.get('minStock')),
        createdAt: editIndex ? inventory[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        inventory[editIndex] = item;
        form.removeAttribute('data-edit-index');
    } else {
        inventory.push(item);
    }
    
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('inventoryModal'));
    modal.hide();
    form.reset();
    loadInventoryTable();
    updateDashboardStats();
}

function deleteInventoryItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(index, 1);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        loadInventoryTable();
        updateDashboardStats();
    }
}

// Staff Management
function loadStaffTable() {
    const tbody = document.getElementById('staffTable');
    tbody.innerHTML = '';
    
    staff.forEach((member, index) => {
        const row = `
            <tr>
                <td>STF-${String(index + 1).padStart(4, '0')}</td>
                <td>${member.name}</td>
                <td>${member.role}</td>
                <td>${member.department}</td>
                <td>${member.shift}</td>
                <td><span class="badge bg-success">Active</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editStaff(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStaff(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updateStaffDepartmentDropdown();
}

function editStaff(index) {
    const member = staff[index];
    if (member) {
        document.querySelector('#staffForm input[name="name"]').value = member.name;
        document.querySelector('#staffForm select[name="role"]').value = member.role;
        document.querySelector('#staffForm select[name="department"]').value = member.department;
        document.querySelector('#staffForm select[name="shift"]').value = member.shift;
        
        document.getElementById('staffForm').setAttribute('data-edit-index', index);
        const modal = new bootstrap.Modal(document.getElementById('staffModal'));
        modal.show();
    }
}

function saveStaff() {
    const form = document.getElementById('staffForm');
    const formData = new FormData(form);
    const editIndex = form.getAttribute('data-edit-index');
    
    const member = {
        name: formData.get('name'),
        role: formData.get('role'),
        department: formData.get('department'),
        shift: formData.get('shift'),
        status: 'Active',
        createdAt: editIndex ? staff[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex) {
        staff[editIndex] = member;
        form.removeAttribute('data-edit-index');
    } else {
        staff.push(member);
    }
    
    localStorage.setItem('staff', JSON.stringify(staff));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('staffModal'));
    modal.hide();
    form.reset();
    loadStaffTable();
    updateDashboardStats();
}

function deleteStaff(index) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        staff.splice(index, 1);
        localStorage.setItem('staff', JSON.stringify(staff));
        loadStaffTable();
        updateDashboardStats();
    }
}

function updateStaffDepartmentDropdown() {
    const select = document.querySelector('#staffForm select[name="department"]');
    select.innerHTML = '<option value="">Select Department</option>';
    
    departments.forEach(dept => {
        select.innerHTML += `<option value="${dept.name}">${dept.name}</option>`;
    });
}

// Emergency Management
function loadEmergencyTable() {
    const tbody = document.getElementById('emergencyTable');
    tbody.innerHTML = '';
    
    emergencyCases.forEach((emergency, index) => {
        const priorityClass = {
            'Critical': 'bg-danger',
            'High': 'bg-warning',
            'Medium': 'bg-info',
            'Low': 'bg-success'
        };
        
        const row = `
            <tr>
                <td>EMG-${String(index + 1).padStart(4, '0')}</td>
                <td>${emergency.patient}</td>
                <td><span class="badge ${priorityClass[emergency.priority]}">${emergency.priority}</span></td>
                <td>${emergency.condition}</td>
                <td>${emergency.doctor}</td>
                <td><span class="badge bg-warning">${emergency.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="resolveEmergency(${index})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmergency(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updatePatientDropdowns();
    updateDoctorDropdowns();
}

function saveEmergency() {
    const form = document.getElementById('emergencyForm');
    const formData = new FormData(form);
    
    const emergency = {
        patient: formData.get('patient'),
        priority: formData.get('priority'),
        condition: formData.get('condition'),
        doctor: formData.get('doctor'),
        status: 'Active',
        createdAt: new Date().toISOString()
    };
    
    emergencyCases.push(emergency);
    localStorage.setItem('emergencyCases', JSON.stringify(emergencyCases));
    
    // Create notification
    addNotification(`New ${emergency.priority} priority emergency case for ${emergency.patient}`, 'emergency');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('emergencyModal'));
    modal.hide();
    form.reset();
    loadEmergencyTable();
    updateDashboardStats();
}

function resolveEmergency(index) {
    if (confirm('Mark this emergency case as resolved?')) {
        emergencyCases[index].status = 'Resolved';
        emergencyCases[index].resolvedAt = new Date().toISOString();
        localStorage.setItem('emergencyCases', JSON.stringify(emergencyCases));
        loadEmergencyTable();
        updateDashboardStats();
    }
}

function deleteEmergency(index) {
    if (confirm('Are you sure you want to delete this emergency case?')) {
        emergencyCases.splice(index, 1);
        localStorage.setItem('emergencyCases', JSON.stringify(emergencyCases));
        loadEmergencyTable();
        updateDashboardStats();
    }
}

// Notifications Management
function loadNotifications() {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';
    
    if (notifications.length === 0) {
        container.innerHTML = '<p class="text-muted">No notifications</p>';
        return;
    }
    
    notifications.slice(-10).reverse().forEach((notification, index) => {
        const timeAgo = getTimeAgo(new Date(notification.createdAt));
        const iconClass = {
            'emergency': 'fas fa-ambulance text-danger',
            'appointment': 'fas fa-calendar text-info',
            'inventory': 'fas fa-boxes text-warning',
            'general': 'fas fa-bell text-primary'
        };
        
        const notificationHtml = `
            <div class="notification-item p-3 border-bottom ${notification.read ? '' : 'bg-light'}">
                <div class="d-flex align-items-start">
                    <i class="${iconClass[notification.type] || iconClass.general} me-3 mt-1"></i>
                    <div class="flex-grow-1">
                        <p class="mb-1">${notification.message}</p>
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                    ${!notification.read ? '<span class="badge bg-primary">New</span>' : ''}
                </div>
            </div>
        `;
        container.innerHTML += notificationHtml;
    });
    
    updateAlerts();
}

function addNotification(message, type = 'general') {
    const notification = {
        message: message,
        type: type,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateDashboardStats();
}

function markAllRead() {
    notifications.forEach(notification => notification.read = true);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    loadNotifications();
    updateDashboardStats();
}

function updateAlerts() {
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
    const activeEmergencies = emergencyCases.filter(e => e.status === 'Active');
    const todayAppointments = appointments.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.date).toDateString() === today;
    });
    
    document.getElementById('lowStockAlert').style.display = lowStockItems.length > 0 ? 'block' : 'none';
    document.getElementById('emergencyAlert').style.display = activeEmergencies.length > 0 ? 'block' : 'none';
    document.getElementById('appointmentAlert').style.display = todayAppointments.length > 0 ? 'block' : 'none';
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

// Update the main showSection function to handle new sections
const originalShowSection = showSection;
showSection = function(sectionName) {
    originalShowSection(sectionName);
    
    switch(sectionName) {
        case 'inventory':
            loadInventoryTable();
            break;
        case 'staff':
            loadStaffTable();
            break;
        case 'emergency':
            loadEmergencyTable();
            break;
        case 'notifications':
            loadNotifications();
            break;
    }
};

// Update dashboard stats to include new metrics
const originalUpdateDashboardStats = updateDashboardStats;
updateDashboardStats = function() {
    originalUpdateDashboardStats();
    
    document.getElementById('emergencyCases').textContent = emergencyCases.filter(e => e.status === 'Active').length;
    document.getElementById('totalStaff').textContent = staff.length;
    document.getElementById('lowStockItems').textContent = inventory.filter(item => item.quantity <= item.minStock).length;
    document.getElementById('pendingNotifications').textContent = notifications.filter(n => !n.read).length;
};

// Load sample data for new features
function loadNewSampleData() {
    inventory = JSON.parse(localStorage.getItem('inventory')) || [
        { name: 'Surgical Gloves', category: 'Consumables', quantity: 50, minStock: 100, createdAt: new Date().toISOString() },
        { name: 'Stethoscope', category: 'Medical Equipment', quantity: 15, minStock: 5, createdAt: new Date().toISOString() },
        { name: 'Syringes', category: 'Consumables', quantity: 200, minStock: 150, createdAt: new Date().toISOString() }
    ];
    
    staff = JSON.parse(localStorage.getItem('staff')) || [
        { name: 'Sarah Johnson', role: 'Nurse', department: 'Cardiology', shift: 'Morning', status: 'Active', createdAt: new Date().toISOString() },
        { name: 'Mike Wilson', role: 'Technician', department: 'Laboratory', shift: 'Evening', status: 'Active', createdAt: new Date().toISOString() }
    ];
    
    emergencyCases = JSON.parse(localStorage.getItem('emergencyCases')) || [
        { patient: 'John Doe', priority: 'High', condition: 'Chest pain', doctor: 'Dr. Smith', status: 'Active', createdAt: new Date().toISOString() }
    ];
    
    notifications = JSON.parse(localStorage.getItem('notifications')) || [
        { message: 'Low stock alert: Surgical Gloves below minimum level', type: 'inventory', read: false, createdAt: new Date().toISOString() },
        { message: 'New emergency case registered', type: 'emergency', read: false, createdAt: new Date().toISOString() }
    ];
    
    users = JSON.parse(localStorage.getItem('users')) || [
        { 
            name: 'Admin User', 
            email: 'admin@hospital.com', 
            password: 'admin123', 
            role: 'admin', 
            department: 'Administration', 
            status: 'Active', 
            permissions: ['all'],
            createdAt: new Date().toISOString()
        },
        { 
            name: 'Dr. Ahmed Ali', 
            email: 'doctor@hospital.com', 
            password: 'doctor123', 
            role: 'doctor', 
            department: 'Cardiology', 
            status: 'Active', 
            permissions: ['patients', 'doctors', 'departments', 'visits', 'admissions', 'wards', 'beds', 'appointments', 'billing', 'pharmacy', 'lab', 'reports', 'inventory', 'staff', 'emergency'],
            createdAt: new Date().toISOString()
        },
        { 
            name: 'Nurse Sarah', 
            email: 'nurse@hospital.com', 
            password: 'nurse123', 
            role: 'nurse', 
            department: 'General', 
            status: 'Active', 
            permissions: ['patients', 'visits', 'admissions', 'wards', 'beds', 'appointments', 'pharmacy', 'lab', 'inventory', 'emergency'],
            createdAt: new Date().toISOString()
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('staff', JSON.stringify(staff));
    localStorage.setItem('emergencyCases', JSON.stringify(emergencyCases));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('users', JSON.stringify(users));
}

