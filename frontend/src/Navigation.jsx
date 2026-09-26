import { useState } from "react";
import { ArrowUpRight, Heart, LogOut, Menu, X } from "lucide-react";
import Brand from "./components/Brand";
import Modal from "./components/Modal";

const menus = {
  donor: [
    { id: "dashboard", name: "My overview" },
    { id: "history", name: "Giving history" },
    { id: "rewards", name: "Milestones" },
  ],
  requester: [
    { id: "dashboard", name: "Hospital overview" },
    { id: "submit", name: "Request blood" },
  ],
  admin: [
    { id: "dashboard", name: "Network overview" },
    { id: "hospitals", name: "Hospitals" },
    { id: "donors", name: "Donors" },
  ],
};

export default function Navigation({
  role,
  onLogout,
  activeTab,
  setActiveTab,
  userName,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const navigate = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header dashboard-navigation">
        <div className="nav-inner">
          <button
            className="brand-button"
            onClick={() => navigate("dashboard")}
            aria-label="PulseNode overview"
          >
            <Brand />
          </button>
          <nav
            className={`dashboard-tabs${menuOpen ? " is-open" : ""}`}
            aria-label="Dashboard navigation"
            id="dashboard-menu"
          >
            {(menus[role] || []).map((item) => (
              <button
                key={item.id}
                aria-current={activeTab === item.id ? "page" : undefined}
                className={activeTab === item.id ? "active" : ""}
                onClick={() => navigate(item.id)}
              >
                {item.name}
              </button>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="icon-button about-button"
              onClick={() => setAboutOpen(true)}
              aria-label="About our community"
            >
              <Heart size={20} strokeWidth={1.5} />
            </button>
            <span className="account-avatar" title={userName || role}>
              {(userName || role).slice(0, 1).toUpperCase()}
            </span>
            <button
              className="icon-button"
              onClick={onLogout}
              aria-label="Log out"
            >
              <LogOut size={19} />
            </button>
            <button
              className="icon-button menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="dashboard-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <div className="dashboard-context page-width">
        <span className="eyebrow">
          {role === "donor"
            ? "YOUR GIVING JOURNAL"
            : role === "requester"
              ? "YOUR CARE NETWORK"
              : "THE COMMUNITY AT A GLANCE"}
        </span></div>
      {aboutOpen && (
        <Modal onClose={() => setAboutOpen(false)} titleId="about-title">
          <p className="eyebrow">THE POWER OF SHOWING UP</p>
          <h2 id="about-title">
            A community
            <br />
            built on <span>care.</span>
          </h2>
          <p className="login-intro">
            Behind every request is a person, and behind every response is
            someone willing to help. Thank you for being part of PulseNode.
          </p>
          <div className="about-note">
            <Heart size={22} strokeWidth={1.4} />
            <p>
              Your giving journey brings people together, one connection at a
              time.
            </p>
          </div>
          <a
            className="button button-secondary"
            href="https://www.friends2support.org/"
            target="_blank"
            rel="noreferrer"
          >
            Explore Friends2Support <ArrowUpRight size={17} />
          </a>
        </Modal>
      )}
    </>
  );
}
