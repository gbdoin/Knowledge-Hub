import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
});

export const getHubs = async () => {
    const response = await api.get('/hubs');
    return response.data.hubs;
};

export const createHub = async (name: string) => {
    const response = await api.post('/hubs', { name });
    return response.data;
};

export const uploadFile = async (hubName: string, file: File) => {
    const formData = new FormData();
    formData.append('hub_name', hubName);
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const chat = async (hubName: string, message: string) => {
    const response = await api.post('/chat', { hub_name: hubName, message });
    return response.data;
};
