import { API_BASE_URL } from "./config";
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import HospitalCharts from "./components/HospitalCharts";

export default function HospitalDashboard({
  requesterId,
  initialRequestId,
  hospitalName,
}) {
  const [requestStatus, setRequestStatus] = useState(
    initialRequestId ? "open" : "IDLE",
  );
  const [matchMessage, setMatchMessage] = useState("");
  const [internalTab, setInternalTab] = useState("dispatch");
  const [connected, setConnected] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);

  // Track the requestId to mark as complete
  const [currentRequestId, setCurrentRequestId] = useState(initialRequestId);

  const [matchedDonorId, setMatchedDonorId] = useState(null);
  const [trackingData, setTrackingData] = useState(null);

  // Custom icons for the map
  const hospitalIcon = L.divIcon({
    className: "custom-icon",
    html: "<div class='w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center'><div class='w-2 h-2 bg-white rounded-full'></div></div>",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const donorIcon = L.divIcon({
    className: "custom-icon",
    html: "<div class='w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse'><div class='w-2 h-2 bg-white rounded-full'></div></div>",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  useEffect(() => {
    // Fetch Hospital Analytics
    axios
      .get(`${API_BASE_URL}/api/analytics/hospital/${requesterId}`)
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error("Failed to fetch analytics", err));

    // Fetch Hospital History
    axios
      .get(`${API_BASE_URL}/api/hospitals/${requesterId}/history`)
      .then((res) => {
        setHistory(res.data);
        if (!initialRequestId && res.data.length > 0) {
          const active = res.data.find((r) => r.status === "open");
          if (active) {
            setCurrentRequestId(active.requestId);
            setRequestStatus("open");
          }
        }
      })
      .catch((err) => console.error("Failed to fetch history", err));

    const socket = new SockJS(`${API_BASE_URL}/ws-blood-donation`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe(`/topic/requests/${requesterId}`, (message) => {
          const response = JSON.parse(message.body);
          if (response.status === "matched") {
            setMatchMessage(
              `🚨 Match Confirmed: ${response.donorName} is on the way!`,
            );
            setRequestStatus("MATCHED");
            if (response.requestId) {
              setCurrentRequestId(response.requestId);
            }
            if (response.donorId) {
              setMatchedDonorId(response.donorId);
            }

            // Just use the coordinates and distance passed in the matched event payload!
            if (response.donorLat && response.hospLat) {
              setTrackingData({
                latitude: response.donorLat,
                longitude: response.donorLng,
                hospLat: response.hospLat,
                hospLng: response.hospLng,
                distanceKm: response.distanceKm,
              });
            }
          }
        });
      },
    });

    stompClient.activate();
    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [requesterId, initialRequestId]);

  const handleCompleteDonation = async () => {
    if (!matchedDonorId) {
      alert("Error: Missing Donor ID!");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/donations/${currentRequestId}/complete`,
        {
          donorId: matchedDonorId,
        },
      );
      alert("Donation marked as completed!");
      setRequestStatus("COMPLETED");
      setTrackingData(null);
      // refresh analytics
      const res = await axios.get(
        `${API_BASE_URL}/api/analytics/hospital/${requesterId}`,
      );
      setAnalytics(res.data);

      // refresh history
      const histRes = await axios.get(
        `${API_BASE_URL}/api/hospitals/${requesterId}/history`,
      );
      setHistory(histRes.data);
    } catch (e) {
      console.error("Failed to complete donation", e);
      alert("Failed to complete donation");
    }
  };

  // Get today's date formatted
  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleCancelRequest = async (requestId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/requests/${requestId}/cancel`);
      // refresh history
      const histRes = await axios.get(
        `${API_BASE_URL}/api/hospitals/${requesterId}/history`,
      );
      setHistory(histRes.data);
      if (currentRequestId === requestId) {
        setRequestStatus("CANCELLED");
        setMatchMessage("");
        setTrackingData(null);
      }
    } catch (e) {
      console.error("Failed to cancel request", e);
      alert("Failed to cancel request");
    }
  };

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
            Hospital Overview
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Manage emergencies and monitor analytics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:space-x-4">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-zinc-100 font-bold text-zinc-600 text-sm">
            {today}
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-zinc-100">
            <div
              className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-lime-400" : "bg-rose-500"} animate-pulse`}
            ></div>
            <span className="text-sm font-bold text-zinc-700">
              {connected ? "Feed Active" : "Disconnected"}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-[32px] p-4 shadow-sm border border-zinc-100 relative overflow-hidden group">
              <h3 className="text-zinc-500 font-bold mb-4">Total Requests</h3>
              <div className="flex items-end space-x-1">
                <span className="text-5xl font-extrabold text-zinc-900 tracking-tighter">
                  {analytics?.totalRequests || 0}
                </span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all"></div>
            </div>

            <div className="bg-white rounded-[32px] p-4 shadow-sm border border-zinc-100 relative overflow-hidden group">
              <h3 className="text-zinc-500 font-bold mb-4">Fulfillment Rate</h3>
              <div className="flex items-end space-x-1">
                <span className="text-5xl font-extrabold text-zinc-900 tracking-tighter">
                  {analytics ? analytics.fulfillmentRate.toFixed(0) : 0}
                </span>
                <span className="text-2xl font-bold text-zinc-400 pb-1">%</span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-lime-400/20 rounded-full blur-2xl group-hover:bg-lime-400/30 transition-all"></div>
            </div>

            <div className="bg-white rounded-[32px] p-4 shadow-sm border border-zinc-100 relative overflow-hidden group">
              <h3 className="text-zinc-500 font-bold mb-4">Active Donors</h3>
              <div className="flex items-end space-x-1">
                <span className="text-5xl font-extrabold text-zinc-900 tracking-tighter">
                  {analytics?.activeDonorsInArea || 0}
                </span>
                <span className="text-zinc-400 font-medium pb-2 text-sm">
                  nearby
                </span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            </div>
          </div>

          <div className="flex bg-zinc-100/80 backdrop-blur-md p-1.5 rounded-2xl w-max mt-2">
            <button
              onClick={() => setInternalTab("dispatch")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${internalTab === "dispatch" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              Live Dispatch
            </button>
            <button
              onClick={() => setInternalTab("analytics")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${internalTab === "analytics" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              Analytics
            </button>
          </div>

          {internalTab === "analytics" ? (
            <HospitalCharts />
          ) : (
            <div className="space-y-4">
              <div className="bg-[#151515] rounded-[32px] p-5 text-white shadow-xl relative overflow-hidden min-h-[320px] mt-6">
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-zinc-400 font-bold mb-6 flex justify-between items-center">
                    <span>Active Emergency Dispatch</span>
                    <span className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${requestStatus === "COMPLETED" ? "bg-blue-400" : requestStatus === "CANCELLED" ? "bg-zinc-400" : "bg-lime-400"} animate-pulse`}
                      ></span>
                      Live Monitor
                    </span>
                  </h3>

                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <span
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest mb-6 border ${
                        requestStatus === "MATCHED"
                          ? "bg-lime-400/10 text-lime-400 border-lime-400/20"
                          : requestStatus === "COMPLETED"
                            ? "bg-blue-400/10 text-blue-400 border-blue-400/20"
                            : requestStatus === "CANCELLED"
                              ? "bg-zinc-400/10 text-zinc-400 border-zinc-400/20"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}
                    >
                      {requestStatus === "MATCHED"
                        ? "Match Found"
                        : requestStatus === "COMPLETED"
                          ? "Mission Complete"
                          : requestStatus === "CANCELLED"
                            ? "Cancelled"
                            : requestStatus === "IDLE"
                              ? "Standby"
                              : "Open - Searching"}
                    </span>

                    {matchMessage &&
                    requestStatus !== "COMPLETED" &&
                    requestStatus !== "CANCELLED" ? (
                      <div className="w-full flex flex-col items-center animate-fade-in">
                        <h2 className="text-xl font-extrabold text-white mb-4">
                          {matchMessage}
                        </h2>

                        {trackingData ? (
                          <div className="w-full max-w-2xl bg-zinc-800 p-2 rounded-2xl border border-zinc-700 mb-6">
                            <div className="flex justify-between items-center px-4 mb-2">
                              <span className="text-zinc-400 font-bold text-sm">
                                DISTANCE
                              </span>
                              <span className="text-lime-400 font-extrabold text-xl">
                                {trackingData.distanceKm} km
                              </span>
                            </div>
                            <div className="h-64 w-full rounded-xl overflow-hidden mb-2 relative z-0">
                              <MapContainer
                                center={[
                                  trackingData.hospLat,
                                  trackingData.hospLng,
                                ]}
                                zoom={13}
                                style={{
                                  height: "100%",
                                  width: "100%",
                                  zIndex: 0,
                                }}
                                zoomControl={false}
                              >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {/* Hospital Marker */}
                                <Marker
                                  position={[
                                    trackingData.hospLat,
                                    trackingData.hospLng,
                                  ]}
                                  icon={hospitalIcon}
                                >
                                  <Popup>Hospital</Popup>
                                </Marker>

                                <Polyline
                                  positions={[
                                    [
                                      trackingData.latitude,
                                      trackingData.longitude,
                                    ],
                                    [
                                      trackingData.hospLat,
                                      trackingData.hospLng,
                                    ],
                                  ]}
                                  color="#a3e635"
                                  dashArray="10, 10"
                                  weight={3}
                                  opacity={0.7}
                                />

                                {/* Donor Static Marker */}
                                <Marker
                                  position={[
                                    trackingData.latitude,
                                    trackingData.longitude,
                                  ]}
                                  icon={donorIcon}
                                >
                                  <Popup>Donor Location</Popup>
                                </Marker>
                              </MapContainer>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-2xl h-64 bg-zinc-800 rounded-2xl border border-zinc-700 mb-6 flex items-center justify-center">
                            <div className="animate-pulse text-zinc-500 font-bold">
                              Establishing GPS Connection...
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleCompleteDonation}
                          className="px-8 py-4 bg-lime-400 text-black rounded-2xl font-extrabold hover:bg-lime-300 transition shadow-[0_0_20px_rgba(212,247,112,0.3)]"
                        >
                          Verify Blood Donation
                        </button>
                      </div>
                    ) : requestStatus === "COMPLETED" ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          Donation Processed
                        </h2>
                      </div>
                    ) : requestStatus === "CANCELLED" ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-zinc-400/20 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-3xl">✕</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          Request Cancelled
                        </h2>
                      </div>
                    ) : requestStatus === "IDLE" ? (
                      <div className="space-y-4">
                        <div className="w-24 h-24 border-2 border-dashed border-zinc-600 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center mx-auto">
                          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🌍</span>
                          </div>
                        </div>
                        <h2 className="text-xl font-bold text-zinc-300">
                          System Online
                        </h2>
                        <p className="font-medium text-zinc-500">
                          No active dispatches. Ready to broadcast.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 opacity-60">
                        <div className="w-16 h-16 border-4 border-zinc-700 border-t-rose-500 rounded-full animate-spin mx-auto"></div>
                        <p className="font-medium text-zinc-400">
                          Broadcasting SOS to local radar...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dark card decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[32px] p-5 shadow-sm border border-zinc-100 h-full overflow-y-auto">
            <h3 className="text-xl font-extrabold text-zinc-900 mb-6 flex justify-between items-center">
              <span>Recent Activity</span>
            </h3>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl opacity-50">📋</span>
                </div>
                <p className="text-zinc-500 font-medium">
                  Activity log will appear here once you process donations.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <div
                    key={record.requestId}
                    className="group p-4 rounded-2xl hover:bg-zinc-50 transition border border-transparent hover:border-zinc-100 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-extrabold text-zinc-900">
                        Request #{record.requestId}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg ${record.status === "completed" ? "bg-blue-100 text-blue-600" : record.status === "cancelled" ? "bg-zinc-100 text-zinc-600" : record.status === "matched" ? "bg-lime-100 text-lime-700" : "bg-rose-100 text-rose-600"}`}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-zinc-500">
                        {record.bloodTypeNeeded} ({record.unitsNeeded} units)
                      </span>
                      <span className="font-bold text-zinc-400 text-xs flex items-center">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {record.status === "open" && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleCancelRequest(record.requestId)}
                          className="text-xs font-bold bg-zinc-100 hover:bg-rose-100 hover:text-rose-600 text-zinc-500 px-3 py-1 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
