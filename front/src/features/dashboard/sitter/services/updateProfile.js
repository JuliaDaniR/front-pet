import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Actualiza el perfil del usuario.
 * @param {Object} profileData - Datos del perfil a actualizar.
 * @param {string} profileData.name - Nombre del usuario.
 * @param {string} profileData.phone - Teléfono del usuario.
 * @param {Object} profileData.location - Dirección del usuario.
 * @param {string} profileData.location.street - Calle.
 * @param {string} profileData.location.number - Número.
 * @param {string} profileData.location.city - Ciudad.
 * @param {string} profileData.location.province - Provincia.
 * @param {string} profileData.location.country - País.
 * @param {string[]} profileData.professionalRoles - Roles profesionales.
 * @returns {Promise} Respuesta de la API.
 */
export const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const { name, phone, location, professionalRoles } = profileData;
  const payload = {
    name,
    phone,
    location,
    professionalRoles,
  };
  const response = await axios.put(
    `${API_BASE_URL}/user/update-profile-frontend`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};