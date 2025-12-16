import axios from 'axios';

// Assuming the API Gateway or main application runs on 8080
const API_URL = 'http://localhost:8080/api'; 
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export default {
    // Auth & Users
    login: (email, password) => api.post('/auth/login', { email, password }),
    
    // FIX: Maps api.requestOtp (used in Register.jsx) to the backend's /auth/register/request-phone-otp
    requestOtp: (data) => api.post('/auth/register/request-phone-otp', data),
    
    // FIX: Maps api.verifyOtp (used in Register.jsx) to the backend's /auth/register/verify-phone-otp
    verifyOtp: (data) => api.post('/auth/register/verify-phone-otp', data),

    register: (data) => api.post('/auth/register', data),
    getDoctors: () => api.get('/auth/doctors'),
    
    // Insurance (Policy Service)
    getPolicies: () => api.get('/insurance/list'),
    renewPolicy: (policyNo) => api.put(`/insurance/renew/${policyNo}`),
    verifyPolicy: (policyNo) => api.get(`/insurance/verify/${policyNo}`), 
    addPolicy: (data) => api.post('/policy/add', data), 

    // Appointments (Visit Service)
    bookAppointment: (data) => api.post('/appointment/book', data),
    rescheduleAppointment: (id, data) => api.put(`/appointment/reschedule/${id}`, data), 
    getMyAppointments: (id) => api.get(`/appointment/user/${id}`),
    getDoctorSchedule: (doctorId) => api.get(`/appointment/doctor/${doctorId}`), 
    updateAppointmentStatus: (id, status) => api.put(`/appointment/status/${id}`, status, { headers: { 'Content-Type': 'text/plain' } }),

    // Claims (Claim Service)
    initiateClaim: (data) => api.post('/claim/initiate', data),
    getMyClaims: (userId) => api.get(`/claim/user/${userId}`),
    submitClaim: (data) => api.put(`/claim/doctor-update/${data.policyNo}`, data), 
    
    // Provider Dashboard Endpoints
    getProviderMetrics: (providerName) => api.get(`/claim/provider/metrics/${providerName}`),
    getHighValueClaims: (providerName) => api.get(`/claim/provider/highvalue/${providerName}`),
    getAllProviderClaims: (providerName) => api.get(`/claim/provider/all/${providerName}`),
    processClaimAction: (claimId, status, notes) => api.put(
        `/claim/provider/action/${claimId}?status=${status}`, 
        notes 
    ),
    
    // Dashboard & Reviews
    getDoctorStats: (doctorId) => api.get(`/dashboard/doctor-stats/${doctorId}`),
    submitReview: (data) => api.post('/dashboard/review', data), 
};