import api from '../../axiosConfig';

const getDashboard = async () => {
  try {
    const response = await api.get('/formando/dashboard', {
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    throw error;
  }
};

export default {
  getDashboard
};