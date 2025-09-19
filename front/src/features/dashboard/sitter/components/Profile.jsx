import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../../shared/ui/Card";
import { Button } from "../../../../shared/ui/Button";
import { Input } from "../../../../shared/ui/Input";
import { Label } from "../../../../shared/ui/Label";
import { Checkbox } from "../../../../shared/ui/Checkbox";
import { useState } from "react";
import { useEffect } from "react";
import { getProfile } from "../services/getProfile";
import { updateProfile } from "../services/updateProfile";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: { description: "", placeId: "" },
    professionalRoles: [],
  });
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const profile = await getProfile();
      let locationObj = { description: "", placeId: "" };
      let locationStr = "";

      if (profile.location) {
        if (profile.location.placeId) {
          locationObj = {
            description: profile.location.description,
            placeId: profile.location.placeId,
          };
          locationStr = profile.location.description;
        } else {
          // Evitamos comas mal ubicadas
          const parts = [
            profile.location.street && profile.location.number
              ? `${profile.location.street} ${profile.location.number}`
              : profile.location.street,
            profile.location.city,
            profile.location.province,
            profile.location.country,
          ].filter(Boolean);

          locationStr = parts.join(", "); // ✅ corregido
          locationObj = { description: locationStr, placeId: "" };
        }
      }

      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        location: locationObj,
        professionalRoles: profile.professionalRoles || [],
      });
      setLocationInput(locationStr);
    }

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "location") {
      setLocationInput(value);

      if (value.length > 2) {
        fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/autocomplete?input=${encodeURIComponent(value)}`
        )
          .then((res) => res.json())
          .then((data) => setLocationSuggestions(data))
          .catch(() => setLocationSuggestions([]));
      } else {
        setLocationSuggestions([]);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [id.replace("profile", "").toLowerCase()]: value,
      }));
    }
  };

  const handleLocationSelect = (suggestion) => {
    setForm((prev) => ({ ...prev, location: suggestion }));
    setLocationInput(suggestion.description);
    setLocationSuggestions([]);
  };

  const handleRoleChange = (role) => {
    setForm((prev) => {
      const roles = prev.professionalRoles.includes(role)
        ? prev.professionalRoles.filter((r) => r !== role)
        : [...prev.professionalRoles, role];
      return { ...prev, professionalRoles: roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    // Validamos que siempre haya placeId
    if (!form.location.placeId) {
      setError("Debés seleccionar la dirección de la lista de sugerencias.");
      setLoading(false);
      return;
    }

    try {
      await updateProfile(form);
      setSuccess(true);
    } catch {
      setError("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Perfil</CardTitle>
        <CardDescription>Gestiona tu información como cuidador</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profileName">Nombre</Label>
              <Input
                id="profileName"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="profilePhone">Teléfono</Label>
              <Input
                id="profilePhone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Dirección</Label>
              <Input
                id="location"
                value={locationInput}
                onChange={handleChange}
                autoComplete="off"
              />
              {locationSuggestions.length > 0 && (
                <div
                  className="absolute z-50 mt-1 min-w-[8rem] max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                  style={{ position: "absolute" }}
                >
                  {locationSuggestions.map((s, idx) => (
                    <div
                      key={s.placeId || idx}
                      className="relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleLocationSelect(s)}
                    >
                      <span className="flex items-center gap-2 line-clamp-1">
                        {s.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Roles profesionales</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["PASEADOR", "VETERINARIO", "PELUQUERO", "CUIDADOR"].map(
                  (role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={form.professionalRoles.includes(role)}
                        onCheckedChange={() => handleRoleChange(role)}
                      />
                      <Label htmlFor={role}>
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
          {success && (
            <div className="text-green-600">¡Perfil actualizado!</div>
          )}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
