import { API_BASE_URL } from "./config";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import { isCompatible } from "./utils/bloodLogic";

// A warm outlined marker keeps maps consistent with the rest of the network.
const DefaultIcon = L.divIcon({
  className: "custom-location-icon",
  html: '<div class="map-pin"></div>',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});
L.Marker.prototype.options.icon = DefaultIcon;
const EMPTY_IGNORED_IDS = new Set();

const MapView = ({
  onAccept,
  onDecline,
  donorBloodType,
  ignoredIds = EMPTY_IGNORED_IDS,
}) => {
  const [requests, setRequests] = useState([]);
  const [userPos, setUserPos] = useState(() =>
    navigator.geolocation ? null : [12.9716, 77.5946],
  );

  useEffect(() => {
    // Request user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location", error);
          // Fallback to default
          setUserPos([12.9716, 77.5946]);
        },
      );
    }

    const fetchRequests = () => {
      axios
        .get(`${API_BASE_URL}/api/requests/active`)
        .then((res) => {
          const valid = res.data.filter((r) => !ignoredIds.has(r.requestId));
          setRequests(valid);
        })
        .catch((err) => console.error("Error fetching active requests", err));
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [ignoredIds]);

  const handleDeclineLocal = (requestId) => {
    setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    if (onDecline) {
      onDecline(requestId);
    }
  };

  const handleAcceptLocal = (requestId) => {
    setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    if (onAccept) {
      onAccept(requestId);
    }
  };

  // Show a loading state until we have either the user's location or the fallback
  if (!userPos) {
    return (
      <div className="bg-iris-shadow p-10 rounded-3xl shadow flex flex-col items-center justify-center h-[400px]">
        <div className="w-12 h-12 border-4 border-iris-border border-t-clinical-cyan rounded-full animate-spin mb-4"></div>
        <p className="text-ash font-medium">Acquiring radar lock...</p>
      </div>
    );
  }

  // Custom icon for user location
  const userIcon = L.divIcon({
    className: "custom-user-icon",
    html: `<div style="width: 20px; height: 20px; background-color: #00b1ff; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-[400] bg-iris-shadow/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-none border border-deep-iris/20">
        <h2 className="text-sm font-semibold text-white">Live Radar</h2>
      </div>
      <div style={{ height: "400px", width: "100%" }}>
        <MapContainer
          center={userPos}
          zoom={13}
          style={{ height: "400px", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {/* User Location Marker */}
          <Marker position={userPos} icon={userIcon}>
            <Popup>
              <strong>You are here</strong>
            </Popup>
          </Marker>

          {requests.map((req) =>
            req.latitude && req.longitude ? (
              <Marker
                key={req.requestId}
                position={[req.latitude, req.longitude]}
              >
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <strong className="text-clinical-cyan block text-lg mb-1">
                      {req.bloodTypeNeeded} needed!
                    </strong>
                    <span className="text-xs font-semibold bg-deep-iris text-white px-2 py-1 rounded-full mb-2 inline-block uppercase">
                      {req.urgencyLevel}
                    </span>
                    <p className="text-ash text-sm font-medium mt-1 mb-4">
                      Units: {req.unitsNeeded}
                    </p>

                    {donorBloodType &&
                    !isCompatible(donorBloodType, req.bloodTypeNeeded) ? (
                      <div className="w-full text-ash font-semibold text-xs py-2 px-2 bg-deep-iris rounded-lg">
                        Not a match for {donorBloodType}
                      </div>
                    ) : onAccept ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleAcceptLocal(req.requestId)}
                          className="flex-1 bg-iris-pulse hover:bg-iris-pulse text-white font-semibold text-xs py-2 px-2 rounded-lg transition shadow-none"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineLocal(req.requestId)}
                          className="flex-1 bg-deep-iris hover:bg-deep-iris text-ash font-semibold text-xs py-2 px-2 rounded-lg transition"
                        >
                          Decline
                        </button>
                      </div>
                    ) : null}
                  </div>
                </Popup>
              </Marker>
            ) : null,
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
