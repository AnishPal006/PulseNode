import { API_BASE_URL } from "./config";
import { useState, useEffect } from "react";
import axios from "axios";
import HospitalDashboard from "./HospitalDashboard";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom icon
const locationIcon = L.divIcon({
  className: "custom-location-icon",
  html: '<div class="map-pin"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function LocationMarker({ pos, setPos }) {
  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
    },
  });

  return pos === null ? null : (
    <Marker position={pos} icon={locationIcon}>
      <Popup>SOS Broadcast Location</Popup>
    </Marker>
  );
}

export default function SubmitRequest({ requesterId, hospitalName, onBack }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [bloodType, setBloodType] = useState("O-");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState("urgent");
  const [location, setLocation] = useState(hospitalName || "");

  // Geolocation state
  const [pos, setPos] = useState(() =>
    navigator.geolocation ? null : [12.9716, 77.5946],
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Geolocation failed", error);
          setPos([12.9716, 77.5946]); // fallback
        },
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/requests`, {
        requester: { requesterId: requesterId }, // Links to the logged-in hospital[cite: 3]
        bloodTypeNeeded: bloodType,
        unitsNeeded: parseInt(units),
        location: location,
        urgencyLevel: urgency,
        latitude: pos ? pos[0] : 12.9716,
        longitude: pos ? pos[1] : 77.5946,
      });

      // Capture the new request ID and transition to the live dashboard
      setActiveRequestId(response.data.requestId);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Failed to broadcast SOS. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // If successfully submitted, immediately show the live tracking dashboard
  if (isSubmitted) {
    return (
      <div className="animate-fade-in w-full">
        <button
          onClick={() => setIsSubmitted(false)}
          className="mb-8 text-ash hover:text-white font-semibold transition flex items-center"
        >
          <span className="mr-2">←</span> Submit Another Request
        </button>
        <HospitalDashboard
          requesterId={requesterId}
          initialRequestId={activeRequestId}
          hospitalName={hospitalName || "Hospital"}
        />
      </div>
    );
  }

  // Otherwise, show the professional submission form
  return (
    <div className="request-page w-full max-w-5xl mx-auto">
      {onBack && (
        <button className="text-button mb-5" onClick={onBack}>
          ← Back to overview
        </button>
      )}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-semibold text-white tracking-tight">
          Care starts with a <span>connection.</span>
        </h2>
        <p className="text-ash font-medium mt-2">
          Alert eligible donors within a 10km radius instantly.
        </p>
      </div>

      <div className="request-card flex flex-col lg:flex-row gap-10 border border-iris-border">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="request-blood-type"
                  className="block text-sm font-semibold text-white mb-2 pl-2"
                >
                  Blood Type Needed
                </label>
                <select
                  id="request-blood-type"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full rounded-2xl bg-deep-iris border-transparent shadow-none p-4 text-white font-semibold focus:ring-4 focus:ring-iris-pulse/20 focus:border-iris-veil focus:bg-iris-shadow outline-none transition-all cursor-pointer"
                >
                  <option>O-</option>
                  <option>O+</option>
                  <option>A-</option>
                  <option>A+</option>
                  <option>B-</option>
                  <option>B+</option>
                  <option>AB-</option>
                  <option>AB+</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="request-units"
                  className="block text-sm font-semibold text-white mb-2 pl-2"
                >
                  Units Required
                </label>
                <input
                  id="request-units"
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full rounded-2xl bg-deep-iris border-transparent shadow-none p-4 text-white font-semibold focus:ring-4 focus:ring-iris-pulse/20 focus:border-iris-veil focus:bg-iris-shadow outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3 pl-2">
                Urgency Level
              </label>
              <div className="flex space-x-4">
                <label
                  className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    urgency === "urgent"
                      ? "border-iris-veil bg-deep-iris text-white"
                      : "border-iris-border bg-deep-iris text-ash hover:bg-deep-iris"
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value="urgent"
                    checked={urgency === "urgent"}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold uppercase tracking-wider text-sm">
                    Critical SOS
                  </span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    urgency === "standard"
                      ? "border-iris-veil bg-deep-iris text-white"
                      : "border-iris-border bg-deep-iris text-ash hover:bg-deep-iris"
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value="standard"
                    checked={urgency === "standard"}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold uppercase tracking-wider text-sm">
                    Standard
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="facility-name"
                className="block text-sm font-semibold text-white mb-2 pl-2"
              >
                Facility Name
              </label>
              <input
                id="facility-name"
                type="text"
                required
                placeholder="Hospital or facility name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-2xl bg-deep-iris border-transparent shadow-none p-4 text-white font-semibold focus:ring-4 focus:ring-iris-pulse/20 focus:border-iris-veil focus:bg-iris-shadow outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !pos}
              className="button button-primary w-full mt-4"
            >
              {loading
                ? "Sending your request…"
                : !pos
                  ? "Finding your location…"
                  : "Send blood request"}
            </button>
          </form>
        </div>

        <div className="flex-1 flex flex-col space-y-3">
          <label className="block text-sm font-semibold text-white pl-2">
            Dispatch Location
          </label>
          <div className="flex-1 min-h-[300px] rounded-3xl overflow-hidden border-4 border-iris-border shadow-none relative">
            {pos ? (
              <MapContainer
                center={pos}
                zoom={14}
                style={{ height: "300px", width: "100%", zIndex: 0 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker pos={pos} setPos={setPos} />
              </MapContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-deep-iris text-ash font-medium">
                <div className="w-8 h-8 border-4 border-iris-border border-t-iris-border rounded-full animate-spin mb-4"></div>
                Locating your facility...
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 z-[400] bg-iris-shadow/90 backdrop-blur text-xs font-semibold text-ash px-4 py-3 rounded-xl shadow-none text-center">
              You can tap the map to adjust the precise dispatch coordinates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
