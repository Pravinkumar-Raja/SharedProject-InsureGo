import axios from 'axios';

// ⚠️ CRITICAL FIX FOR GATEWAY ⚠️
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
    // --- AUTH ---
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    requestOtp: (data) => api.post('/auth/register/request-phone-otp', data),
    verifyOtp: (data) => api.post('/auth/register/verify-phone-otp', data),

    // --- PATIENT ---
    getAllPolicies: () => api.get('/insurance/list'), 
    getMyPolicies: (userId) => api.get(`/insurance/user/${userId}`),
    getMarketplacePlans: () => api.get('/insurance/plans/all'),
    purchasePolicy: (data) => api.post('/insurance/purchase', data),
    
    // Manual Policy Management
    addPolicy: (data) => api.post('/insurance/manual-entry', data), 
    updatePolicy: (id, data) => api.put(`/insurance/update/${id}`, data), 
    deletePolicy: (id) => api.delete(`/insurance/delete/${id}`), 
    renewPolicy: (policyNo) => api.put(`/insurance/renew/${policyNo}`),

    // --- PROVIDER ---
    getProviderCustomers: (providerName) => api.get(`/insurance/provider/${providerName}`),
    addMarketplacePlan: (data) => api.post('/insurance/plans/add', data),
    deleteMarketplacePlan: (id) => api.delete(`/insurance/plans/delete/${id}`),
    updateMarketplacePlan: (id, data) => api.put(`/insurance/plans/update/${id}`, data),
    
    getAllProviderClaims: (providerName) => api.get(`/claim/provider/all/${providerName}`),
    getProviderMetrics: (providerName) => api.get(`/claim/provider/metrics/${providerName}`),
    processClaimAction: (claimId, status, notes) => api.put(`/claim/provider/action/${claimId}?status=${status}`, notes),

    // --- DOCTOR ---
    getDoctorSchedule: (doctorId) => api.get(`/appointment/doctor/${doctorId}`), 
    verifyPolicy: (policyNo) => api.get(`/insurance/verify/${policyNo}`), 
    initiateClaim: (data) => api.post('/claim/initiate', data),
    updateAppointmentStatus: (id, status) => api.put(`/appointment/status/${id}`, status, { headers: { 'Content-Type': 'text/plain' } }),
    getDoctorStats: (doctorId) => api.get(`/dashboard/doctor-stats/${doctorId}`),

    // --- COMMON ---
    submitReview: (data) => api.post('/dashboard/review', data), 
    getMyClaims: (userId) => api.get(`/claim/user/${userId}`),
    getMyAppointments: (id) => api.get(`/appointment/user/${id}`),
    getDoctors: () => api.get('/auth/doctors'),
    
    // FIXED: Bridge for saving appointments
    bookAppointment: (data) => api.post('/appointment/book', data),
    
};