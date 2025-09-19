import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../../shared/ui/Card";
import { Button } from "../../../../shared/ui/Button";
import { Badge } from "../../../../shared/ui/Badge";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "../../../../shared/ui/Dialog";
import { Input } from "../../../../shared/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../../../../shared/ui/Select";

/**
 * BookingCard con modales para cancelar y reprogramar.
 */
export default function BookingCard({ booking, handleAction, actionLoading }) {
  const bookingId = booking.id ?? booking.bookingId;
  const [detail, setDetail] = useState(booking);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Estados de los modales
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);

  const normalize = (s) => (s || "").toString().toUpperCase();
  const isPending = (s) => ["PENDIENTE", "PENDING", "PENDIENTE_REPROGRAMAR"].includes(normalize(s));
  const isConfirmed = (s) => ["CONFIRMADO", "CONFIRMED"].includes(normalize(s));
  const isCancelled = (s) => ["CANCELADO", "CANCELLED"].includes(normalize(s));
  const isCompleted = (s) => ["COMPLETADO", "COMPLETED"].includes(normalize(s));

  // Carga detalle de reserva si hace falta
  useEffect(() => {
    if (Array.isArray(booking.items) && booking.items.length > 0) {
      setDetail(booking);
      return;
    }
    let cancelled = false;
    async function fetchDetail() {
      setLoadingDetail(true);
      try {
        const base = "http://localhost:8080";
        const tryUrls = [`${base}/booking/${bookingId}`, `${base}/sitter/booking/${bookingId}`];
        let resp = null;
        for (const url of tryUrls) {
          try {
            resp = await fetch(url, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }).then((r) => r.json());
            if (resp) break;
          } catch (err) {
            console.error("Error fetching booking detail from", url, err);
          }
        }
        if (!cancelled && resp) {
          const payload = resp.data ?? resp;
          setDetail((prev) => ({ ...prev, ...payload }));
        }
      } catch (err) {
        console.error("No se pudo cargar detalle de reserva", bookingId, err);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    }
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [booking, bookingId]);

// Funciones de acción
const openCancelModal = (itemId) => {
  setCurrentItemId(itemId);
  setCancelReason("");
  setCancelModalOpen(true);
};

const submitCancel = async () => {
  if (!cancelReason || !currentItemId) return;
  try {
    await handleAction(bookingId, "item-cancel", currentItemId, cancelReason);
    setCancelModalOpen(false);
    setCurrentItemId(null);
    setCancelReason("");
  } catch (err) {
    alert("No se pudo cancelar el ítem. Intente nuevamente.");
    console.error("Error al cancelar ítem:", err);
  }
};

  const openRescheduleModal = async (itemId) => {
    setCurrentItemId(itemId);
    setSelectedScheduleId(null);

    // Cargar horarios disponibles
    const token = localStorage.getItem("token");
    const resp = await fetch("http://localhost:8080/sitter/available-schedules", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    setAvailableSchedules(resp);
    setRescheduleModalOpen(true);
  };

  const submitReschedule = () => {
    handleAction(bookingId, "item-reschedule", currentItemId, selectedScheduleId);
    setRescheduleModalOpen(false);
  };

  const items = Array.isArray(detail.items) ? detail.items : [];
  const comboLabel = detail.comboOfferingName ?? detail.comboOfferingId ?? null;
  const title = comboLabel
    ? `Combo: ${detail.comboOfferingName ?? `ID ${detail.comboOfferingId}`}`
    : detail.serviceTitle ?? "Servicio";

  return (
    <>
      <Card className="p-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{detail.petName}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loadingDetail && <div className="text-sm text-muted-foreground">Cargando detalle...</div>}

          {items.length === 0 && !loadingDetail && (
            <p className="text-sm text-muted-foreground">No hay ítems disponibles para esta reserva.</p>
          )}

          {items.map((item) => {
            const itemStatus = item.status ?? "";
            const key = item.itemId ?? `${bookingId}-item-${item.offeringName}`;
            return (
              <Card key={key} className="mb-2 p-3 border">
              <p>
                <strong>Servicio:</strong> {item.offeringName}
              </p>
              <p>
                <strong>Profesional:</strong> {item.professionalName}{" "}
                {item.professionalRole ? `(${item.professionalRole})` : ""}
              </p>

              <div className="mt-1">
                <Badge
                variant={
                  isConfirmed(itemStatus)
                  ? "default"
                  : isCancelled(itemStatus)
                  ? "destructive"
                  : "secondary"
                }
                >
                {isConfirmed(itemStatus)
                  ? "Confirmado"
                  : isCancelled(itemStatus)
                  ? "Cancelado"
                  : "Pendiente"}
                </Badge>
              </div>

              {!isCancelled(itemStatus) && (
                <div className="flex gap-2 mt-2">
                {isPending(itemStatus) && (
                  <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAction(bookingId, "item-confirm", item.itemId)}
                  disabled={actionLoading[item.itemId]}
                  >
                  Confirmar ítem
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openCancelModal(item.itemId)}
                  disabled={actionLoading[item.itemId]}
                >
                  Cancelar ítem
                </Button>
                {!isCompleted(itemStatus) && (
                  <Button
                  size="sm"
                  variant="default"
                  onClick={() => openRescheduleModal(item.itemId)}
                  disabled={actionLoading[item.itemId]}
                  >
                  Reprogramar
                  </Button>
                )}
                </div>
              )}
              </Card>
            );
            })}
          </CardContent>
          </Card>

          {/* Modal Cancelar */}
          <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent>
            <DialogTitle>Cancelar servicio</DialogTitle>
            <div className="mt-2">
            <Input
              placeholder="Motivo de cancelación"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            </div>
            <DialogFooter>
            <Button
              variant="destructive"
              onClick={submitCancel}
              disabled={!cancelReason || !currentItemId}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => {
              setCancelModalOpen(false);
              setCurrentItemId(null);
              setCancelReason("");
              }}
            >
              Cerrar
            </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>

          {/* Modal Reprogramar */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent>
          <DialogTitle>Reprogramar servicio</DialogTitle>
          <div className="mt-2">
            <Select
              value={selectedScheduleId}
              onValueChange={(v) => setSelectedScheduleId(v)}
            >
              <SelectTrigger>
                {selectedScheduleId
                  ? availableSchedules.find((s) => s.scheduleId === selectedScheduleId)?.date +
                    " " +
                    availableSchedules.find((s) => s.scheduleId === selectedScheduleId)?.startTime
                  : "Seleccionar nuevo horario"}
              </SelectTrigger>
              <SelectContent>
                {availableSchedules.map((s) => (
                  <SelectItem key={s.scheduleId} value={s.scheduleId}>
                    {s.date} {s.startTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={submitReschedule}
              disabled={!selectedScheduleId}
            >
              Reprogramar
            </Button>
            <Button variant="destructive" onClick={() => setRescheduleModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
