import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  ShieldCheck,
  MapPin,
  Plus,
  Minus,
  Menu,
  X,
  Building2,
  Fingerprint,
  Check,
  Droplet,
  Radio,
  Users,
  Activity,
  ChevronDown,
  Pause,
  Play,
} from "lucide-react";
import Brand from "./components/Brand";
import Modal from "./components/Modal";
import NetworkIllustration from "./components/NetworkIllustration";
import ScrollShowcase from "./components/ScrollShowcase";
import useScrollReveal from "./hooks/useScrollReveal";
import useMotionExperience from "./hooks/useMotionExperience";
import MotionBackdrop from "./components/MotionBackdrop";

const questions = [
  [
    "How does PulseNode connect me with a hospital?",
    "When a hospital requests blood, PulseNode looks for donors with a compatible blood group in the surrounding area. You'll see matching requests in your donor dashboard and can choose whether to respond.",
  ],
  [
    "What do I need to create a donor profile?",
    "Sign in with your Google account, then add your phone number and blood group. Your location helps the network connect you with requests close to you.",
  ],
  [
    "Can I use PulseNode as a hospital?",
    "Yes. Choose the hospital sign-in option to create your profile, submit blood requests, and follow donor responses from your hospital dashboard.",
  ],
  [
    "Am I committing to donate when I join?",
    "Joining lets you see requests and decide when you can help. Your hospital will confirm your eligibility before any donation.",
  ],
];

export default function LandingPage({
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
}) {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);
  const { paused, reduced, enabled, toggleMotion } =
    useMotionExperience(pageRef);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(0);
  const openLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

  return (
    <div
      className="landing-page"
      ref={pageRef}
      data-motion={enabled ? "on" : "off"}
    >
      <div className="reading-progress" aria-hidden="true" />
      <button
        className="motion-toggle"
        onClick={toggleMotion}
        disabled={reduced}
        aria-pressed={paused || reduced}
        aria-label={
          reduced
            ? "Reduced motion enabled in system settings"
            : paused
              ? "Resume animations"
              : "Pause animations"
        }
      >
        {paused || reduced ? <Play size={13} /> : <Pause size={13} />}
        <span>
          {reduced
            ? "Reduced motion"
            : paused
              ? "Resume motion"
              : "Pause motion"}
        </span>
      </button>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="nav-inner">
          <a href="#" aria-label="PulseNode home">
            <Brand />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#how-it-works">
              How it works <ChevronDown size={13} />
            </a>
            <a href="#community">Our network</a>
            <a href="#hospitals">
              For hospitals <ArrowUpRight size={13} />
            </a>
          </nav>
          <div className="nav-actions">
            <button className="text-button login-nav" onClick={openLogin}>
              Log in <ArrowUpRight size={14} />
            </button>
            <button
              className="button button-primary nav-cta"
              onClick={openLogin}
            >
              Become a donor <ArrowUpRight size={16} />
            </button>
            <button
              className="icon-button menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile navigation"
          >
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#community" onClick={() => setMenuOpen(false)}>
              Our network
            </a>
            <a href="#hospitals" onClick={() => setMenuOpen(false)}>
              For hospitals
            </a>
            <button onClick={openLogin}>
              Log in <ArrowUpRight size={16} />
            </button>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section
          className="hero-section"
          aria-labelledby="hero-title"
          data-motion-zone
          data-pointer-surface
        >
          <MotionBackdrop />
          <div className="hero-inner page-width">
            <div className="hero-art">
              <div className="hero-art-depth">
                <NetworkIllustration />
              </div>
              <span className="schematic-label">
                <span /> DESIGNED FOR HUMAN CONNECTION
              </span>
            </div>
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow">
                <span className="signal-dot" /> A NETWORK WITH A PURPOSE
              </p>
              <h1 id="hero-title">
                <span className="hero-line">Lifesaving care.</span>
                <span className="hero-line">Better</span>
                <span className="hero-line">
                  <span className="word-highlight">
                    <span className="headline-shimmer motion-loop">
                      connected.
                    </span>
                  </span>
                </span>
              </h1>
              <p className="hero-description">
                The right donor. The right place. The moment it matters.
                <br className="desktop-break" /> We connect people and hospitals
                to keep life moving.
              </p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={openLogin}>
                  Become a donor <ArrowUpRight size={18} />
                </button>
                <a className="button button-ghost" href="#how-it-works">
                  Explore the network <ArrowRight size={18} />
                </a>
              </div><div className="hero-proof">
                <span>
                  <ShieldCheck size={15} /> Secure sign-in
                </span>
                <i />
                <span>
                  <MapPin size={15} /> Local connections
                </span>
                <i />
                <span>
                  <Heart size={15} /> Human impact
                </span>
              </div>
            </div>
          </div>
        </section>

        <ScrollShowcase onJoin={openLogin} />

        <section
          className="connection-strip page-width"
          data-reveal
          aria-label="The PulseNode network"
        >
          <p>
            One shared purpose.
            <br />
            <strong>A more connected future.</strong>
          </p>
          <div>
            <strong>8</strong>
            <span>
              Blood groups.
              <br />
              One community.
            </span>
          </div>
          <div>
            <strong>
              10<span> km</span>
            </strong>
            <span>
              Local connections.
              <br />
              Meaningful reach.
            </span>
          </div>
          <div>
            <Radio size={33} strokeWidth={1.3} />
            <span>
              Real-time requests.
              <br />
              Care in motion.
            </span>
          </div>
        </section>

        <section id="how-it-works" className="light-section">
          <div className="page-width section-space">
            <div className="centered-heading" data-reveal>
              <p className="eyebrow">SIMPLER CONNECTIONS. STRONGER CARE.</p>
              <h2>
                From a willing donor
                <br />
                to a world of difference.
              </h2>
              <p>
                A connected experience, from your first sign-in to your next
                donation.
              </p>
            </div>
            <div className="steps-grid">
              <article className="step-card" data-scroll-scene="card">
                <div className="step-top">
                  <Fingerprint size={28} strokeWidth={1.5} />
                  <span>01</span>
                </div>
                <h3>Make it personal.</h3>
                <p>
                  Create your profile with your blood group and location. Let
                  the right connections find you.
                </p>
                <div className="step-detail">
                  <Check size={14} /> A profile that starts with you
                </div>
              </article>
              <article className="step-card" data-scroll-scene="card">
                <div className="step-top">
                  <Radio size={28} strokeWidth={1.5} />
                  <span>02</span>
                </div>
                <h3>Find your match.</h3>
                <p>
                  See compatible requests from nearby hospitals. Stay connected
                  to the care your community needs.
                </p>
                <div className="step-detail">
                  <MapPin size={14} /> Matched within your local area
                </div>
              </article>
              <article className="step-card" data-scroll-scene="card">
                <div className="step-top">
                  <Heart size={28} strokeWidth={1.5} />
                  <span>03</span>
                </div>
                <h3>Show up for life.</h3>
                <p>
                  Respond when you can help. Coordinate with the hospital and
                  follow your giving journey.
                </p>
                <div className="step-detail">
                  <Activity size={14} /> Every connection counts
                </div>
              </article>
            </div>
            <div className="trust-pair">
              <span>
                <ShieldCheck size={23} strokeWidth={1.4} /> Secure Google
                sign-in
              </span>
              <span>
                <Fingerprint size={23} strokeWidth={1.4} /> Your choice, every
                time
              </span>
            </div>
          </div>
        </section>

        <section
          id="community"
          className="community-section page-width section-space"
        >
          <div className="community-copy" data-reveal>
            <p className="eyebrow">CONNECTED BY SOMETHING BIGGER</p>
            <h2>
              A human network.
              <br />
              An extraordinary
              <br />
              kind of impact.
            </h2>
            <p>
              Behind every request is a person. Behind every response is someone
              willing to help.
            </p>
            <p>
              We bring them together through a local network built around
              compatibility, connection, and care.
            </p>
            <button className="button button-ghost" onClick={openLogin}>
              Find your place <ArrowUpRight size={18} />
            </button>
          </div>
          <div
            className="community-diagram"
            data-reveal
            data-motion-zone
            data-scroll-scene="network"
            aria-hidden="true"
          >
            <div className="network-orbit orbit-outer" />
            <div className="network-orbit orbit-inner" />
            <div className="network-center">
              <Activity size={43} strokeWidth={1.3} />
            </div>
            <div className="network-node node-one">
              <Heart size={23} />
              <span>Donors</span>
            </div>
            <div className="network-node node-two">
              <Building2 size={23} />
              <span>Hospitals</span>
            </div>
            <div className="network-node node-three">
              <Users size={23} />
              <span>Community</span>
            </div>
            <svg viewBox="0 0 480 400">
              <path
                d="M240 200 92 104M240 200 375 115M240 200 270 340"
                stroke="currentColor"
                strokeDasharray="4 7"
                fill="none"
              />
            </svg>
            <span className="diagram-caption">
              PEOPLE AT THE HEART OF THE NETWORK
            </span>
          </div>
        </section>

        <section id="hospitals" className="hospital-section">
          <div className="page-width hospital-inner" data-reveal>
            <div className="hospital-badge">
              <Building2 size={32} strokeWidth={1.4} />
            </div>
            <div>
              <p className="eyebrow">BUILT FOR THE PEOPLE WHO CARE</p>
              <h2>
                Your next donor.
                <br />
                Already closer.
              </h2>
              <p>
                Request blood, connect with compatible donors, and follow
                responses. One clear view of your care network.
              </p>
            </div>
            <button className="button button-ghost" onClick={openLogin}>
              Join as a hospital <ArrowUpRight size={18} />
            </button>
          </div>
        </section>

        <section className="faq-section page-width section-space" data-reveal>
          <div>
            <p className="eyebrow">A LITTLE MORE CLARITY</p>
            <h2>
              Good questions.
              <br />
              Clear answers.
            </h2>
            <p>Everything you need to take the first step.</p>
          </div>
          <div className="faq-list">
            {questions.map(([question, answer], i) => (
              <article className="faq-item" key={question}>
                <h3>
                  <button
                    onClick={() =>
                      setOpenQuestion(openQuestion === i ? null : i)
                    }
                    aria-expanded={openQuestion === i}
                    aria-controls={`answer-${i}`}
                  >
                    {question}
                    {openQuestion === i ? (
                      <Minus size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </button>
                </h3>
                <div id={`answer-${i}`} hidden={openQuestion !== i}>
                  <p>{answer}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="join-section" data-motion-zone>
          <div className="join-orbits motion-loop" aria-hidden="true" />
          <div className="page-width" data-reveal>
            <Droplet size={32} strokeWidth={1.3} />
            <p className="eyebrow">THE NEXT CONNECTION STARTS WITH YOU</p>
            <h2>
              Be someone's
              <br />
              lifeline.
            </h2>
            <button className="button button-primary" onClick={openLogin}>
              Become a donor <ArrowUpRight size={18} />
            </button>
            <p className="join-note">
              A small step. A life-changing possibility.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <div>
          <a href="#" aria-label="PulseNode home">
            <Brand compact />
          </a>
          <p>Connected by care. Powered by people.</p>
        </div>
        <div className="footer-authorship"><span>© {new Date().getFullYear()} PulseNode</span>
        </div>
        <button className="text-button" onClick={() => setShowAdminLogin(true)}>
          Admin access <ArrowUpRight size={14} />
        </button>
      </footer>

      {loginOpen && (
        <Modal
          onClose={() => setLoginOpen(false)}
          titleId="login-title"
          className="login-modal"
        >
          <p className="eyebrow">YOUR NEXT CONNECTION</p>
          <h2 id="login-title">
            Join a network.
            <br />
            Make a difference.
          </h2>
          <p className="login-intro">
            Choose how you'd like to be part of PulseNode.
          </p>
          {loginError && (
            <p className="form-message" role="alert">
              {loginError}
            </p>
          )}
          <div className="login-options">
            <div>
              <Heart size={26} strokeWidth={1.5} />
              <h3>I'm a donor</h3>
              <p>Be there for someone who needs you.</p>
              <button
                className="button button-primary"
                onClick={loginDonor}
                aria-label="Continue with Google as a donor"
              >
                <span className="google-mark" aria-hidden="true">
                  G
                </span>{" "}
                Continue with Google <ArrowUpRight size={16} />
              </button>
            </div>
            <div>
              <Building2 size={26} strokeWidth={1.5} />
              <h3>I'm with a hospital</h3>
              <p>Connect your patients with local donors.</p>
              <button
                className="button button-secondary"
                onClick={loginHospital}
                aria-label="Continue with Google as a hospital"
              >
                <span className="google-mark" aria-hidden="true">
                  G
                </span>{" "}
                Continue with Google <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
          <p className="login-footnote">
            <ShieldCheck size={15} /> Secure sign-in with your Google account.
          </p>
        </Modal>
      )}
      {showAdminLogin && (
        <Modal onClose={() => setShowAdminLogin(false)} titleId="admin-title">
          <p className="eyebrow">PULSENODE ADMINISTRATION</p>
          <h2 id="admin-title">Welcome back.</h2>
          <p className="login-intro">Sign in to manage your growing network.</p>
          <form onSubmit={handleAdminLogin} className="portal-form">
            {adminError && (
              <p className="form-message" role="alert">
                {adminError}
              </p>
            )}
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="you@hospital.org"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button className="button button-primary" disabled={loading}>
              {loading ? "Signing in…" : "Sign in to the admin portal"}
              <ArrowRight size={17} />
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
