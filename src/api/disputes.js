import axiosInstance from './axiosinstance';

export const createDispute = async (data) => {
    try {
        const response = await axiosInstance.post('/dispute', data);
        return response.data;
    } catch (error) {
        console.error('Error raising dispute:', error);
        throw error;
    }
};

export const getAllDisputes = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/dispute', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching disputes:', error);
        throw error;
    }
};

export const resolveDispute = async (id) => {
    try {
        const response = await axiosInstance.patch(`/dispute/${id}/resolve`);
        return response.data;
    } catch (error) {
        console.error('Error resolving dispute:', error);
        throw error;
    }
};
