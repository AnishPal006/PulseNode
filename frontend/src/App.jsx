import { API_BASE_URL } from "./config";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import axios from "axios";
const DonorDashboard = lazy(() => import("./DonorDashboard"));
const SubmitRequest = lazy(() => import("./SubmitRequest"));
const HospitalDashboard = lazy(() => import("./HospitalDashboard"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const CompleteProfile = lazy(() => import("./CompleteProfile"));
import Navigation from "./Navigation";
import LandingPage from "./LandingPage";
import { useGoogleLogin } from "@react-oauth/google";

export default function App() {
  const [currentView, setCurrentView] = useState(
    () => localStorage.getItem("currentView") || "login",
  ); // login | donor | requester | admin
  const [userId, setUserId] = useState(() =>
    localStorage.getItem("userId")
      ? parseInt(localStorage.getItem("userId"))
      : null,
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem("userName") || "",
  );
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "dashboard",
  );
  const contentRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = contentRef.current?.animate?.(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 350, easing: "cubic-bezier(.22, 1, .36, 1)" },
    );
    return () => animation?.cancel();
  }, [currentView, activeTab]);

  useEffect(() => {
    localStorage.setItem("currentView", currentView);
    if (userId) localStorage.setItem("userId", userId);
    else localStorage.removeItem("userId");
    localStorage.setItem("userName", userName);
    localStorage.setItem("activeTab", activeTab);
  }, [currentView, userId, userName, activeTab]);

  // Used when profile is incomplete
  const [tempUser, setTempUser] = useState(null);

  // Admin login states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });

      if (response.data.role === "admin") {
        setActiveTab("dashboard");
        setCurrentView("admin");
      }
    } catch {
      setAdminError(
        "We couldn’t sign you in. Check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginCustom = async (tokenResponse, role) => {
    setLoginError("");
    try {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        },
      );
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/google-login`,
        {
          token: "mock-google-token",
          role: role,
          email: userInfo.data.email,
          name: userInfo.data.name,
        },
      );

      if (response.status === 200) {
        setUserId(response.data.id);
        setUserName(response.data.name);
        setActiveTab("dashboard");
        setCurrentView(role === "donor" ? "donor" : "requester");
      } else if (response.status === 202) {
        setTempUser(response.data);
      }
    } catch (err) {
      console.error("Google login failed", err);
      setLoginError(
        "We couldn’t complete sign-in. Please try again in a moment.",
      );
    }
  };

  const loginDonor = useGoogleLogin({
    onSuccess: (res) => handleGoogleLoginCustom(res, "donor"),
    onError: () =>
      setLoginError("Google sign-in was unsuccessful. Please try again."),
  });

  const loginHospital = useGoogleLogin({
    onSuccess: (res) => handleGoogleLoginCustom(res, "hospital"),
    onError: () =>
      setLoginError("Google sign-in was unsuccessful. Please try again."),
  });

  const handleProfileComplete = (id, role, name) => {
    setUserId(id);
    setUserName(name);
    setActiveTab("dashboard");
    setCurrentView(role === "donor" ? "donor" : "requester");
    setTempUser(null);
  };

  if (tempUser) {
    return (
      <Suspense fallback={<LoadingView />}>
        <CompleteProfile
          tempUser={tempUser}
          onComplete={handleProfileComplete}
        />
      </Suspense>
    );
  }

  if (currentView === "login") {
    return (
      <LandingPage
        {...{
          loginDonor,
          loginHospital,
          loginError,
          showAdminLogin,
          setShowAdminLogin,
          adminEmail,
          setAdminEmail,
          adminPassword,
          setAdminPassword,
          adminError,
          loading,
          handleAdminLogin,
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Navigation
        role={currentView}
        userName={userName}
        onLogout={() => {
          setCurrentView("login");
          setUserId(null);
          setUserName("");
          setActiveTab("dashboard");
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main id="main-content" className="dashboard-main page-width">
        <div className="dashboard-content" ref={contentRef}>
          <Suspense fallback={<LoadingView />}>
            {currentView === "donor" && (
              <DonorDashboard
                donorId={userId}
                donorName={userName}
                setActiveTab={setActiveTab}
                activeTab={activeTab}
              />
            )}
            {currentView === "requester" &&
              (activeTab === "submit" ? (
                <SubmitRequest
                  requesterId={userId}
                  hospitalName={userName}
                  onBack={() => setActiveTab("dashboard")}
                />
              ) : (
                <HospitalDashboard
                  initialRequestId={null}
                  hospitalName={userName}
                  requesterId={userId}
                  activeTab={activeTab}
                />
              ))}
            {currentView === "admin" && (
              <AdminDashboard activeTab={activeTab} />
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="page-loading" role="status">
      <span />
      Preparing your space…
    </div>
  );
}
