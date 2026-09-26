import { API_BASE_URL } from "./config";
import React, { useState } from "react";
import axios from "axios";
import Brand from "./components/Brand";

export default function CompleteProfile({ tempUser, onComplete }) {
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("O-");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = async (lat, lng) => {
      try {
        const endpoint =
          tempUser.role === "donor" ? "/api/donors" : "/api/requesters";
        const payload =
          tempUser.role === "donor"
            ? {
                name: tempUser.name,
                contactEmail: tempUser.email,
                contactPhone: phone,
                bloodType: bloodType,
                latitude: lat,
                longitude: lng,
                verificationStatus: "verified",
              }
            : {
                name: tempUser.name,
                contactEmail: tempUser.email,
                contactPhone: phone,
                latitude: lat,
                longitude: lng,
                accountType: "hospital_verified",
              };

        const response = await axios.post(
          `${API_BASE_URL}${endpoint}`,
          payload,
        );
        const newId =
          tempUser.role === "donor"
            ? response.data.donorId
            : response.data.requesterId;
        onComplete(newId, tempUser.role, tempUser.name);
      } catch (err) {
        console.error("Failed to complete profile", err);
        const detail = err.response?.data || err.message;
        alert(
          "Failed to complete profile. Server says: " +
            (typeof detail === "object" ? JSON.stringify(detail) : detail),
        );
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          submitData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation failed, using default coordinates", error);
          submitData(12.9716, 77.5946); // Default coordinates if user denies
        },
      );
    } else {
      console.warn("Geolocation not supported, using default coordinates");
      submitData(12.9716, 77.5946); // Default coordinates if not supported
    }
  };

  return (
    <div className="profile-page">
      <Brand />
      <div className="profile-card">
        <p className="eyebrow">YOUR FIRST CONNECTION</p>
        <h2 className="text-3xl font-semibold text-white text-center mb-2 tracking-tight">
          Almost <span>there.</span>
        </h2>
        <p className="text-ash text-center mb-8 font-medium">
          Welcome, {tempUser.name}! Just a few more details to set up your{" "}
          <span className="font-semibold text-white">{tempUser.role}</span>{" "}
          account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="contact-phone"
              className="block text-sm font-semibold text-white mb-2 pl-1"
            >
              Contact phone
            </label>
            <input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Your phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl bg-deep-iris border-transparent shadow-none p-4 text-white font-semibold focus:ring-4 focus:ring-iris-pulse/20 focus:border-iris-veil focus:bg-iris-shadow outline-none transition-all"
            />
          </div>

          {tempUser.role === "donor" && (
            <div>
              <label
                htmlFor="profile-blood-type"
                className="block text-sm font-semibold text-white mb-2 pl-1"
              >
                Blood group
              </label>
              <select
                id="profile-blood-type"
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-primary w-full mt-4"
          >
            {loading ? "Saving..." : "Finish Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
