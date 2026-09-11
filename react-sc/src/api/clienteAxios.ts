import axios from "axios";

const clienteAPI = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7137/api',
    headers: {  
        'Content-Type': 'application/json',
    }
});

clienteAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default clienteAPI;