import { API_BASE_URL } from "./config";
import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import AnimatedNumber from "./components/AnimatedNumber";
import MapView from "./Map";
import confetti from "canvas-confetti";
import HeroCardModal from "./components/HeroCardModal";
import DonorCharts from "./components/DonorCharts";
import { Radio, ScrollText, Heart, ShieldCheck } from "lucide-react";
import { isCompatible } from "./utils/bloodLogic";

export default function DonorDashboard({
  donorId,
  donorName,
  activeTab,
  setActiveTab,
}) {
  const [alerts, setAlerts] = useState([]);
  const [achievementData, setAchievementData] = useState(null);
  const [internalTab, setInternalTab] = useState("action");
  const [showHeroCard, setShowHeroCard] = useState(false);
  const [declinedIds] = useState(
    () =>
      new Set(JSON.parse(localStorage.getItem(`declined_${donorId}`) || "[]")),
  );
  const donorDetailsRef = React.useRef(null);
  useEffect(() => {
    const fetchActive = () => {
      axios
        .get(API_BASE_URL + "/api/requests/active")
        .then((res) => {
          const valid = res.data.filter(
            (r) =>
              !declinedIds.has(r.requestId) &&
              (!donorDetailsRef.current ||
                isCompatible(
                  donorDetailsRef.current.bloodType,
                  r.bloodTypeNeeded,
                )),
          );
          setAlerts(
            valid.map((r) => ({
              requestId: r.requestId,
              bloodType: r.bloodTypeNeeded,
              urgency: r.urgencyLevel,
              message: "Urgent match nearby!",
            })),
          );
        })
        .catch((error) => console.error("Could not refresh requests", error));
    };
    fetchActive();
    const intId = setInterval(fetchActive, 3000);
    return () => clearInterval(intId);
  }, [declinedIds]);
  const [connected, setConnected] = useState(false);
  const [donorDetails, setDonorDetails] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch donor details
    axios
      .get(`${API_BASE_URL}/api/donors/${donorId}`)
      .then((res) => {
        setDonorDetails(res.data);
        donorDetailsRef.current = res.data;
      })
      .catch((err) => console.error("Failed to fetch donor details", err));

    // Fetch history
    axios
      .get(`${API_BASE_URL}/api/donors/${donorId}/history`)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Failed to fetch history", err));

    const socket = new SockJS(`${API_BASE_URL}/ws-blood-donation`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe(`/topic/alerts/${donorId}`, (message) => {
          const newAlert = JSON.parse(message.body);
          setAlerts((prev) => [...prev, newAlert]);
        });

        // Listen for achievements
        stompClient.subscribe(
          `/topic/donors/${donorId}/achievements`,
          (message) => {
            console.log("RECEIVED ACHIEVEMENT MESSAGE:", message.body);
            try {
              const data = JSON.parse(message.body);
              if (data.type === "DONATION_COMPLETED") {
                setAchievementData(data);
                setShowHeroCard(true);

                // Trigger confetti
                var duration = 3 * 1000;
                var animationEnd = Date.now() + duration;
                var defaults = {
                  startVelocity: 30,
                  spread: 360,
                  ticks: 60,
                  zIndex: 100,
                  colors: ["#00b1ff", "#59b4ff", "#4846c6", "#16165c"],
                };

                function randomInRange(min, max) {
                  return Math.random() * (max - min) + min;
                }

                var interval = setInterval(function () {
                  var timeLeft = animationEnd - Date.now();

                  if (timeLeft <= 0) {
                    return clearInterval(interval);
                  }

                  var particleCount = 50 * (timeLeft / duration);
                  confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                      x: randomInRange(0.1, 0.3),
                      y: Math.random() - 0.2,
                    },
                  });
                  confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                      x: randomInRange(0.7, 0.9),
                      y: Math.random() - 0.2,
                    },
                  });
                }, 250);
              }
            } catch (e) {
              console.error("Failed to parse achievement message", e);
            }
          },
        );
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [donorId]);

  const handleAccept = async (requestId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/requests/${requestId}/responses`, {
        donorId: donorId,
        answer: "accept",
      });
      setAlerts(alerts.filter((alert) => alert.requestId !== requestId));
      alert("Thank you! The hospital has been notified of your response.");
    } catch (error) {
      console.error("Failed to send response", error);
    }
  };

  const getNextEligibleDate = (lastDonationDate) => {
    if (!lastDonationDate) return "Eligible Now";
    const date = new Date(lastDonationDate);
    date.setDate(date.getDate() + 56); // 56 days cooldown
    if (date < new Date()) return "Eligible Now";
    return date.toLocaleDateString();
  };

  // Get today's date formatted
  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const renderHeader = (title, subtitle) => (
    <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 space-y-4 md:space-y-0">
      <div>
        <h1 className="text-4xl font-semibold text-white tracking-tighter mb-2">
          {title}
        </h1>
        <p className="text-ash font-medium">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:space-x-4">
        <div className="bg-iris-shadow px-4 py-2 rounded-2xl shadow-none border border-iris-border text-sm font-semibold text-ash">
          {today}
        </div>
        <div className="flex items-center space-x-2 bg-iris-shadow px-4 py-2 rounded-2xl shadow-none border border-iris-border">
          <div
            className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-iris-pulse" : "bg-fog"} status-indicator`}
          ></div>
          <span className="text-sm font-semibold text-white">
            {connected ? "Radar Active" : "Disconnected"}
          </span>
        </div>
      </div>
    </header>
  );

  if (activeTab === "history") {
    return (
      <div className="w-full space-y-4">
        {renderHeader(
          <>
            Your giving <span>journal.</span>
          </>,
          "Every time you showed up. Every connection that mattered.",
        )}
        <div className="bg-iris-shadow rounded-3xl p-10 shadow-none border border-iris-border min-h-[600px]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-deep-iris rounded-full flex items-center justify-center mb-6">
                <span className="empty-icon">
                  <ScrollText />
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No history yet
              </h3>
              <p className="text-ash font-medium">
                Your donation records will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div
                  key={record.recordId}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-3xl hover:bg-deep-iris transition border border-iris-border space-y-4 md:space-y-0"
                >
                  <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="w-14 h-14 shrink-0 bg-deep-iris text-clinical-cyan rounded-full flex items-center justify-center font-semibold text-xl">
                      {record.request.bloodTypeNeeded}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg leading-tight">
                        Hospital Request #{record.request.requestId}
                      </h4>
                      <p className="text-ash font-medium text-sm mt-1">
                        Successfully completed donation
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0">
                    <span className="text-sm font-semibold bg-deep-iris text-ash px-4 py-2 rounded-xl inline-block">
                      {new Date(record.donationDate).toLocaleDateString(
                        undefined,
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "rewards") {
    return (
      <div className="w-full space-y-4">
        {renderHeader(
          <>
            Meaningful <span>milestones.</span>
          </>,
          "A little recognition for the care you share.",
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
          <div
            className={`p-5 rounded-3xl border-2 shadow-none relative overflow-hidden transition-all ${donorDetails?.rewardTier === "Bronze" || donorDetails?.rewardTier === "Silver" || donorDetails?.rewardTier === "Gold" ? "border-iris-veil bg-deep-iris" : "border-iris-border bg-iris-shadow opacity-50"}`}
          >
            <h3 className="text-white font-semibold text-2xl mb-2">
              Bronze Tier
            </h3>
            <p className="text-ash font-medium mb-6">1+ Donations</p>
            <ul className="space-y-3 font-medium text-white">
              <li>✓ Digital Badge</li>
              <li>✓ Priority Support</li>
            </ul>
          </div>
          <div
            className={`p-5 rounded-3xl border-2 shadow-none relative overflow-hidden transition-all ${donorDetails?.rewardTier === "Silver" || donorDetails?.rewardTier === "Gold" ? "border-iris-border bg-deep-iris" : "border-iris-border bg-iris-shadow opacity-50"}`}
          >
            <h3 className="text-ash font-semibold text-2xl mb-2">
              Silver Tier
            </h3>
            <p className="text-ash font-medium mb-6">3+ Donations</p>
            <ul className="space-y-3 font-medium text-white">
              <li>✓ Free Health Checkup</li>
              <li>✓ Exclusive Merch</li>
            </ul>
          </div>
          <div
            className={`p-5 rounded-3xl border-2 shadow-none relative overflow-hidden transition-all ${donorDetails?.rewardTier === "Gold" ? "border-iris-veil bg-deep-iris" : "border-iris-border bg-iris-shadow opacity-50"}`}
          >
            <h3 className="text-white font-semibold text-2xl mb-2">
              Gold Tier
            </h3>
            <p className="text-ash font-medium mb-6">5+ Donations</p>
            <ul className="space-y-3 font-medium text-white">
              <li>✓ Premium Health Insurance Discount</li>
              <li>✓ Gala Dinner Invite</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {renderHeader(
        <>
          Your giving. <span>Your impact.</span>
        </>,
        `Welcome${donorName ? `, ${donorName.split(" ")[0]}` : " back"}. A little of you can mean so much.`,
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Main Stats Block */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-4">
            <div className="bg-iris-shadow rounded-3xl p-5 shadow-none border border-iris-border relative overflow-hidden group">
              <h3 className="text-ash font-semibold mb-4 flex justify-between items-center">
                <span>Total Donations</span>
                <span className="text-xs bg-deep-iris text-white px-2 py-1 rounded-full">
                  <Heart size={12} />
                </span>
              </h3>
              <div className="flex items-end space-x-2">
                <span className="text-6xl font-semibold text-white tracking-tighter">
                  <AnimatedNumber value={donorDetails?.donationCount || 0} />
                </span>
                <span className="text-ash font-medium pb-2">donations</span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-iris-pulse/20 rounded-full blur-3xl group-hover:bg-iris-pulse/30 transition-all"></div>
            </div>

            <div className="bg-iris-shadow rounded-3xl p-5 shadow-none border border-iris-border relative overflow-hidden group">
              <h3 className="text-ash font-semibold mb-4 flex justify-between items-center">
                <span>Reward Tier</span>
                <span className="text-xs bg-deep-iris text-white px-2 py-1 rounded-full">
                  Current
                </span>
              </h3>
              <div className="flex items-end space-x-2">
                <span className="text-5xl font-semibold text-white tracking-tighter">
                  {donorDetails?.rewardTier || "None"}
                </span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-iris-pulse/10 rounded-full blur-3xl group-hover:bg-iris-pulse/20 transition-all"></div>
            </div>
          </div>

          <div className="segmented-control flex w-max mt-2">
            <button
              onClick={() => setInternalTab("action")}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${internalTab === "action" ? "segment-active" : "text-ash hover:text-white"}`}
            >
              Nearby requests
            </button>
            <button
              onClick={() => setInternalTab("impact")}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${internalTab === "impact" ? "segment-active" : "text-ash hover:text-white"}`}
            >
              Community impact
            </button>
          </div>

          {internalTab === "impact" ? (
            <DonorCharts />
          ) : (
            <div className="space-y-4">
              <div className="bg-iris-shadow rounded-3xl p-5 shadow-none border border-iris-border mt-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Active Emergencies
                </h3>
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-deep-iris rounded-full flex items-center justify-center mb-4">
                      <span className="empty-icon">
                        <Radio />
                      </span>
                    </div>
                    <p className="text-ash font-medium">
                      Radar is quiet. No active requests in your area.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.requestId}
                        className="bg-deep-iris border border-iris-veil p-4 md:p-4 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
                      >
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-iris-pulse text-white text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                              {alert.urgency}
                            </span>
                            <h4 className="text-white font-semibold text-base md:text-lg">
                              {alert.message}
                            </h4>
                          </div>
                          <p className="text-white font-medium text-xs md:text-sm">
                            Requested Type:{" "}
                            <span className="font-semibold text-white">
                              {alert.bloodType}
                            </span>
                          </p>
                        </div>
                        <div className="flex w-full md:w-auto space-x-2 md:space-x-3">
                          <button
                            onClick={() => handleAccept(alert.requestId)}
                            className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 bg-iris-pulse text-white rounded-xl md:rounded-2xl font-semibold text-xs md:text-base hover:bg-iris-glow transition shadow-none "
                          >
                            I Can Donate
                          </button>
                          <button
                            onClick={() => {
                              declinedIds.add(alert.requestId);
                              localStorage.setItem(
                                `declined_${donorId}`,
                                JSON.stringify(Array.from(declinedIds)),
                              );
                              setAlerts(
                                alerts.filter(
                                  (a) => a.requestId !== alert.requestId,
                                ),
                              );
                            }}
                            className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 bg-iris-shadow text-clinical-cyan rounded-xl md:rounded-2xl font-semibold text-xs md:text-base hover:bg-deep-iris transition border border-iris-veil"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Radar */}
              <div className="col-span-12">
                <div className="overflow-hidden rounded-3xl shadow-none border border-iris-border">
                  <MapView
                    donorBloodType={donorDetails?.bloodType}
                    ignoredIds={declinedIds}
                    onAccept={handleAccept}
                    onDecline={(requestId) => {
                      declinedIds.add(requestId);
                      localStorage.setItem(
                        `declined_${donorId}`,
                        JSON.stringify(Array.from(declinedIds)),
                      );
                      setAlerts(
                        alerts.filter((a) => a.requestId !== requestId),
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-deep-iris rounded-3xl p-5 text-white shadow-none relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-ash font-semibold mb-6 flex justify-between items-center">
                <span>Your next chapter</span>
                <span className="bg-deep-iris p-2 rounded-xl text-xs">
                  Donor status
                </span>
              </h3>

              <div className="mb-8">
                <div className="text-4xl font-semibold tracking-tight mb-2">
                  {donorDetails
                    ? getNextEligibleDate(donorDetails.lastDonationDate)
                    : "Loading..."}
                </div>
                <p className="text-sm text-ash font-medium">
                  {donorDetails?.lastDonationDate
                    ? "Based on your last recorded donation"
                    : "No previous donation recorded"}
                </p>
              </div>

              <div className="profile-note">
                <ShieldCheck size={21} strokeWidth={1.5} />
                <p>
                  The hospital will confirm your eligibility before you donate.
                </p>
              </div>
            </div>

            {/* Dark card decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-iris-pulse/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-iris-shadow rounded-3xl p-5 shadow-none border border-iris-border h-[400px] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-between">
              <span>History</span>
              <button
                className="history-link"
                onClick={() => setActiveTab("history")}
              >
                View all →
              </button>
            </h3>

            {history.length === 0 ? (
              <p className="text-ash font-medium text-center mt-10">
                No previous donations.
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <div
                    key={record.recordId}
                    className="group p-4 rounded-2xl hover:bg-deep-iris transition border border-transparent hover:border-iris-border"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-white">
                        Request #{record.request.requestId}
                      </span>
                      <span className="text-xs font-semibold bg-deep-iris text-ash px-2 py-1 rounded-lg">
                        {new Date(record.donationDate).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-ash">
                      <span className="w-2 h-2 rounded-full bg-iris-pulse mr-2"></span>
                      Donated {record.request.bloodTypeNeeded}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <HeroCardModal
        show={showHeroCard}
        onClose={() => setShowHeroCard(false)}
        achievementData={achievementData}
      />
    </div>
  );
}
