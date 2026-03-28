import axiosInstance from './axiosinstance';
export const getMeetingById = async (id) => {
    try {
        const response = await axiosInstance.get(`/meetings/id/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching meeting details:', error);
        throw error;
    }
};
export const getAllMeetings = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/meetings/getAllMeetings', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching meetings:', error);
        throw error;
    }
};
