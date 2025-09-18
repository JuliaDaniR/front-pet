// getServicesDescriptions.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Obtiene las descripciones variantes agrupadas por tipo de servicio desde el backend.
 * @param {string} API_BASE_URL - La URL base de la API.
 * @returns {Promise<Object>} Un objeto donde cada clave es un tipo de servicio y su valor es un array de descripciones.
 */
export async function getServicesDescriptions(API_BASE_URL) {
  const url = `${API_BASE_URL}/sitter/list/variant/descriptions`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
}
