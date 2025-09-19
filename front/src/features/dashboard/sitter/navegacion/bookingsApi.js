import axios from 'axios';

// Obtener todas las reservas del cuidador
export const getMyBookings = async () => {
  const response = await axios.get('/user/my-bookings');
  return response.data; // devuelve un array de BookingListDTO
};

// Confirmar reserva completa
export const confirmBooking = async (bookingId) => {
  const response = await axios.put(`/sitter/booking/${bookingId}/confirm`);
  return response.data;
};

// Cancelar reserva completa
export const cancelBooking = async (bookingId) => {
  const response = await axios.put(`/sitter/booking/${bookingId}/cancel`);
  return response.data;
};

// Confirmar un ítem de reserva
export const confirmBookingItem = async (itemId) => {
  const response = await axios.put(`/sitter/booking/item/${itemId}/confirm`);
  return response.data;
};

// Cancelar un ítem de reserva
export const cancelBookingItem = async (itemId) => {
  const response = await axios.put(`/sitter/booking/item/${itemId}/cancel`);
  return response.data;
};

// Proponer reprogramación de un ítem
export const rescheduleBookingItem = async (itemId, newDate) => {
  const response = await axios.put(`/sitter/booking/item/${itemId}/reschedule`, { newDate });
  return response.data;
};
