import axiosInstance from './axiosinstance';

export const getAllNotes = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/notes/getAllNotes', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
    }
};

export const createNote = async (data) => {
    try {
        const response = await axiosInstance.post('/notes/create', data);
        return response.data;
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
};

export const editNote = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/notes/edit/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error editing note:', error);
        throw error;
    }
};

export const deleteNote = async (id) => {
    try {
        const response = await axiosInstance.delete(`/notes/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
};
