import axiosInstance from './axiosinstance';

export const updateProfile = async (formData) => {
    try {
        const response = await axiosInstance.put('/auth/updateProfile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const changePassword = async (data) => {
    try {
        const response = await axiosInstance.post('/auth/changePassword', data);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await axiosInstance.get('/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};
