import axiosInstance from './axiosinstance';

export const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post('/auth/forgetPassword', { email });
        return response.data;
    } catch (error) {
        console.error('Forgot Password Error:', error);
        throw error;
    }
};

export const resetPassword = async (token, password) => {
    try {
        const response = await axiosInstance.post(`/auth/resetPassword/${token}`, { password });
        return response.data;
    } catch (error) {
        console.error('Reset Password Error:', error);
        throw error;
    }
};
