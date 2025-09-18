import axios from 'axios';

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Crea un nuevo servicio individual para el SITTER.
 * @param {Object} serviceData - Datos del servicio a registrar.
 * @param {string} serviceData.name - Tipo de servicio (PASEO, ASEO, GUARDERIA, VETERINARIA).
 * @param {string} serviceData.description - Descripción del servicio.
 * @param {number} serviceData.basePrice - Precio base del servicio.
 * @param {string[]} serviceData.applicablePetTypes - Tipos de mascota aplicables (PERRO, GATO, OTRO).
 * @param {string} serviceData.allowedRole - Rol permitido (PASEADOR, VETERINARIO, PELUQUERO, CUIDADOR).
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function createService(serviceData) {
  const url = `${API_BASE_URL}/sitter/register/offering`;
  
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await axios.post(url, serviceData, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}