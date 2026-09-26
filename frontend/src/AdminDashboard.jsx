import { API_BASE_URL } from "./config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimatedNumber from "./components/AnimatedNumber";

export default function AdminDashboard({ activeTab }) {
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    if (activeTab === "dashboard" || !activeTab) {
      axios
        .get(`${API_BASE_URL}/api/analytics/admin`)
        .then((res) => setStats(res.data))
        .catch((err) => {
          console.error("Failed to fetch admin stats", err);
          setLoadError(true);
        });
    } else if (activeTab === "donors") {
      axios
        .get(`${API_BASE_URL}/api/donors`)
        .then((res) => setDonors(res.data))
        .catch((err) => console.error("Failed to fetch donors", err));
    } else if (activeTab === "hospitals") {
      axios
        .get(`${API_BASE_URL}/api/requesters`)
        .then((res) => setHospitals(res.data))
        .catch((err) => console.error("Failed to fetch hospitals", err));
    }
  }, [activeTab]);

  // Get today's date formatted
  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (activeTab === "donors") {
    return (
      <div className="w-full space-y-6">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-semibold text-white tracking-tight">
              The people who <span>give.</span>
            </h1>
            <p className="text-ash font-medium mt-1">
              Manage all registered donors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:space-x-4">
            <div className="bg-iris-shadow px-4 py-2 rounded-2xl shadow-none border border-iris-border font-semibold text-ash text-sm">
              {today}
            </div>
          </div>
        </header>

        <div className="bg-iris-shadow rounded-3xl p-8 shadow-none border border-iris-border min-h-[600px]">
          <div className="space-y-4">
            {donors.map((donor) => (
              <div
                key={donor.donorId}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 md:p-6 gap-3 md:gap-0 border border-iris-border rounded-2xl hover:bg-deep-iris transition"
              >
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {donor.name}
                  </h3>
                  <p className="text-sm font-medium text-ash break-all md:break-normal">
                    {donor.contactEmail}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:space-x-4">
                  <span className="text-clinical-cyan font-semibold bg-deep-iris px-3 py-1 rounded-lg">
                    {donor.bloodType || "N/A"}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-lg ${donor.verificationStatus === "verified" ? "bg-deep-iris text-white" : "bg-deep-iris text-clinical-cyan"}`}
                  >
                    {donor.verificationStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>
            ))}
            {donors.length === 0 && (
              <p className="text-center text-ash font-medium py-10">
                No donors found.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "hospitals") {
    return (
      <div className="w-full space-y-6">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-semibold text-white tracking-tight">
              Our care <span>partners.</span>
            </h1>
            <p className="text-ash font-medium mt-1">
              Manage all registered hospitals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:space-x-4">
            <div className="bg-iris-shadow px-4 py-2 rounded-2xl shadow-none border border-iris-border font-semibold text-ash text-sm">
              {today}
            </div>
          </div>
        </header>

        <div className="bg-iris-shadow rounded-3xl p-8 shadow-none border border-iris-border min-h-[600px]">
          <div className="space-y-4">
            {hospitals.map((hospital) => (
              <div
                key={hospital.requesterId}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 md:p-6 gap-3 md:gap-0 border border-iris-border rounded-2xl hover:bg-deep-iris transition"
              >
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {hospital.name || "Unnamed"}
                  </h3>
                  <p className="text-sm font-medium text-ash break-all md:break-normal">
                    {hospital.contactEmail || "No Email"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:space-x-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-lg ${hospital.verificationStatus === "verified" ? "bg-deep-iris text-white" : "bg-deep-iris text-clinical-cyan"}`}
                  >
                    {hospital.verificationStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>
            ))}
            {hospitals.length === 0 && (
              <p className="text-center text-ash font-medium py-10">
                No hospitals found.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            A community, <span>connected.</span>
          </h1>
          <p className="text-ash font-medium mt-1">
            A thoughtful overview of your network and its impact.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:space-x-4">
          <div className="bg-iris-shadow px-4 py-2 rounded-2xl shadow-none border border-iris-border font-semibold text-ash text-sm">
            {today}
          </div>
          <div className="flex items-center space-x-2 bg-iris-shadow px-4 py-2 rounded-2xl shadow-none border border-iris-border">
            <div className="w-2.5 h-2.5 rounded-full bg-iris-pulse animate-pulse"></div>
            <span className="text-sm font-semibold text-white">
              Network overview
            </span>
          </div>
        </div>
      </header>

      {stats ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-deep-iris text-white p-8 rounded-3xl shadow-none relative overflow-hidden group">
                <h3 className="text-ash font-semibold text-sm mb-4">
                  Total Donors
                </h3>
                <p className="text-6xl font-semibold tracking-tighter relative z-10">
                  <AnimatedNumber value={stats.totalDonors} />
                </p>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-iris-pulse/20 rounded-full blur-3xl group-hover:bg-iris-pulse/30 transition-all"></div>
              </div>

              <div className="bg-deep-iris text-white p-8 rounded-3xl shadow-none relative overflow-hidden group">
                <h3 className="text-ash font-semibold text-sm mb-4">
                  Active Verified
                </h3>
                <p className="text-6xl font-semibold tracking-tighter relative z-10">
                  <AnimatedNumber value={stats.activeDonors} />
                </p>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-iris-pulse/20 rounded-full blur-3xl group-hover:bg-iris-pulse/30 transition-all"></div>
              </div>

              <div className="bg-iris-shadow p-8 rounded-3xl shadow-none border border-iris-border col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-6 sm:space-y-0 group relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-ash font-semibold text-sm mb-2">
                    Platform Success Rate
                  </h3>
                  <div className="flex items-end space-x-2">
                    <p className="text-7xl font-semibold text-white tracking-tighter">
                      {stats.totalRequests
                        ? Math.round(
                            (stats.fulfilledRequests / stats.totalRequests) *
                              100,
                          )
                        : 0}
                    </p>
                    <span className="text-3xl font-semibold text-ash pb-2">
                      %
                    </span>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-sm font-semibold text-ash mb-1">
                    Total Completed Donations
                  </p>
                  <p className="text-3xl font-semibold text-white">
                    <AnimatedNumber value={stats.totalCompletedDonations} />
                  </p>
                </div>
                <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-iris-pulse/10 rounded-full blur-3xl group-hover:bg-iris-pulse/20 transition-all"></div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-iris-shadow p-8 rounded-3xl shadow-none border border-iris-border h-full flex flex-col justify-center relative overflow-hidden group">
              <h3 className="text-ash font-semibold text-sm mb-4 relative z-10">
                Avg Response Time
              </h3>
              <div className="flex items-end space-x-2 relative z-10">
                <p className="text-6xl font-semibold text-white tracking-tighter">
                  <AnimatedNumber value={stats.avgResponseTimeMins} />
                </p>
                <p className="text-xl font-semibold text-ash pb-1">mins</p>
              </div>
              <p className="text-xs font-semibold text-clinical-cyan bg-deep-iris w-max px-3 py-1 rounded-lg mt-4 relative z-10">
                Highly Efficient
              </p>

              <div className="absolute top-0 right-0 w-32 h-32 bg-iris-pulse/10 rounded-full blur-2xl group-hover:bg-iris-pulse/20 transition-all"></div>
            </div>
          </div>
        </div>
      ) : loadError ? (
        <div className="bg-deep-iris rounded-3xl p-8 text-center">
          <h3 className="text-xl mb-3">Your network is taking a moment.</h3>
          <p className="text-ash text-sm">
            We couldn’t load the latest overview. Please refresh to try again.
          </p>
        </div>
      ) : (
        <div
          className="flex justify-center items-center h-64"
          role="status"
          aria-label="Loading network overview"
        >
          <div className="w-12 h-12 border-4 border-iris-border border-t-iris-border rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
