import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} userData - Datos del usuario a registrar
 * @param {string} userData.login - Email del usuario (requerido)
 * @param {string} userData.pass1 - Contraseña (requerido, debe cumplir patrón: min 8 chars, 1 número, 1 mayúscula)
 * @param {string} userData.pass2 - Confirmación de contraseña (requerido, debe coincidir con pass1)
 * @param {string} userData.role - Rol del usuario (OWNER o SITTER)
 * @returns {Promise<Object>} - Respuesta del servidor
 * @throws {Error} - Error en caso de fallo en el registro
 */
export const registerUser = async (userData) => {
  try {
    // Validaciones
    if (!userData.login || !userData.pass1 || !userData.pass2) {
      throw new Error('Todos los campos obligatorios deben estar completos');
    }

    if (userData.pass1 !== userData.pass2) {
      throw new Error('Las contraseñas no coinciden');
    }

    // Contraseña de minimo 8 caracteres, al menos un número y mayuscula
    const passwordPattern = /^(?=.*[0-9])(?=.*[A-Z]).{8,}$/;
    if (!passwordPattern.test(userData.pass1)) {
      throw new Error('La contraseña debe tener al menos 8 caracteres, incluir 1 número y 1 mayúscula');
    }

    if (!passwordPattern.test(userData.pass2)) {
      throw new Error('La confirmación de contraseña debe tener al menos 8 caracteres, incluir 1 número y 1 mayúscula');
    }

    // Rol
    const validRoles = ['OWNER', 'SITTER'];
    if (userData.role && !validRoles.includes(userData.role)) {
      throw new Error('Rol de usuario no válido');
    }

    const registerPayload = {
      login: userData.login,
      pass1: userData.pass1,
      pass2: userData.pass2,
      ...(userData.role && { role: userData.role })
    };

    const response = await axios.post(`${API_BASE_URL}/user/register`, registerPayload);

    return {
      success: true,
      message: response.data,
      status: response.status
    };

  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data || `Error HTTP: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error(error.message || 'Error desconocido');
    }
  }
};

export const isValidPassword = (password) => {
	// Contraseña de minimo 8 caracteres, al menos un número y mayuscula
  const pattern = /^(?=.*[0-9])(?=.*[A-Z]).{8,}$/;
  return pattern.test(password);
};

export const isValidEmail = (email) => {
	// Correo básico válido
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};