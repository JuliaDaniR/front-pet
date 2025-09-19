import { useEffect, useState } from "react";
import axios from "axios";
import BookingCard from "./BookingCard";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const API_BASE = "http://localhost:8080";

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/user/my-bookings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBookings(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const refreshBooking = async (bookingId) => {
    try {
      const tryUrls = [`${API_BASE}/booking/${bookingId}`, `${API_BASE}/sitter/booking/${bookingId}`];
      let resp = null;
      for (const url of tryUrls) {
        try {
          resp = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
          if (resp?.data) break;
        } catch (e) {}
      }
      const detail = resp?.data?.data ?? resp?.data ?? null;
      if (detail) setBookings(prev => prev.map(b => (b.id ?? b.bookingId) === bookingId ? { ...b, ...detail } : b));
      else await fetchBookings();
    } catch {
      await fetchBookings();
    }
  };

const handleAction = async (bookingId, action, itemId = null, extra = null) => {
  const key = itemId ?? bookingId;
  setActionLoading(prev => ({ ...prev, [key]: true }));

  try {
    let url = "";
    let params = {};
    switch (action) {
      case "confirm":
        url = `/sitter/booking/${bookingId}/confirm`;
        break;
      case "cancel":
        url = `/sitter/booking/${bookingId}/cancel`;
        break;
      case "reschedule":
        url = `/sitter/booking/item/${itemId}/reschedule`;
        params = { scheduleId: extra };
        break;
      case "item-confirm":
        url = `/sitter/booking/item/${itemId}/confirm`;
        break;
      case "item-cancel":
        url = `/sitter/booking/item/${itemId}/cancel`;
        params = { reason: extra };
        break;
      default:
        return;
    }

    const response = await axios.put(
      `${API_BASE}${url}`,
      null,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, params }
    );

    // Mensaje de éxito
    alert(response.data?.message || "Acción realizada con éxito");

    await refreshBooking(bookingId);
  } catch (err) {
    console.error(err);
    // Mensaje de error
    const msg = err.response?.data?.message || "Error al ejecutar la acción";
    alert(msg);
  } finally {
    setActionLoading(prev => ({ ...prev, [key]: false }));
  }
};

  if (loading) return <p>Cargando reservas...</p>;
  if (!bookings.length) return <p>No tenés reservas próximas.</p>;

  return (
    <div className="space-y-4">
      {bookings.map(b => (
        <BookingCard
          key={b.id ?? b.bookingId}
          booking={b}
          handleAction={handleAction}
          actionLoading={actionLoading}
        />
      ))}
    </div>
  );
}
