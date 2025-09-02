import axios from 'axios';

const api = axios.create({
    baseURL: "https://backend-4tkw.onrender.com",
    withCredentials: true,
});

export default api;