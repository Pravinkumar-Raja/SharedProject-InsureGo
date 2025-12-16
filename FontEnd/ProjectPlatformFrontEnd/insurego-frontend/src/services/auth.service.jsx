import api from './api';

// Matches Backend DTO: PhoneRequest { phoneNumber }
const requestPhoneOtp = (phoneNumber) => {
    return api.post('/auth/register/request-phone-otp', { 
        phoneNumber: phoneNumber 
    });
};

// Matches Backend DTO: OtpRequest { identifier, code }
const verifyPhoneOtp = (phoneNumber, otpCode) => {
    return api.post('/auth/register/verify-phone-otp', { 
        identifier: phoneNumber, 
        code: otpCode 
    });
};

const register = (userData) => {
    return api.post('/auth/register', userData);
};

const login = async (email, password) => {
    // Backend returns the token string directly
    const response = await api.post('/auth/login', { email, password });
    if (response.data) {
        localStorage.setItem('token', response.data); 
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
};

export default {
    requestPhoneOtp,
    verifyPhoneOtp,
    register,
    login,
    logout
};