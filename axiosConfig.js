import axios from 'axios';

const api = axios.create({
    baseURL: "https://backend-4tkw.onrender.com",
});

export const setToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;