import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getServices() {
  try {
    const response = await axios.get(`${API_BASE_URL}/sitter/my/offering`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.data && response.data.status === 'success') {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return [];
  }
}
