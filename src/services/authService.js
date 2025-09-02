import api from '../../axiosConfig';


export const loginUser = async (email, password) => {
    try {
        const response = await api.post(
            `/auth/login`,
            {email, password},
       
    );
        return response.data;
    } catch (err) {
        throw err.response?.data?.message || 'Login failed';
    }
};