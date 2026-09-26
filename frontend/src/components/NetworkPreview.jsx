import { useState } from "react";
import {
  Activity,
  Users,
  Radio,
  ArrowUpRight,
  MapPin,
  Building2,
  Droplet,
  Check,
} from "lucide-react";

import AnimatedNumber from "./AnimatedNumber";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "matches", label: "Donor matches", icon: Users },
  { id: "activity", label: "Activity", icon: Radio },
];

export default function NetworkPreview({ onJoin }) {
  const [active, setActive] = useState("overview");
  return (
    <section
      className="network-preview page-width"
      data-reveal
      data-motion-zone
      aria-label="Interactive network preview"
    >
      <span className="preview-edge-trace motion-loop" aria-hidden="true" />
      <div className="preview-top">
        <div className="preview-identity">
          <span className="preview-logo">
            <Activity size={22} />
          </span>
          <div>
            <strong>Your network. In sync.</strong>
            <span>A clearer view of the connections that matter.</span>
          </div>
        </div>
        <span className="sample-label">INTERACTIVE PREVIEW · SAMPLE DATA</span>
      </div>
      <div className="preview-layout">
        <aside className="preview-profile">
          <div className="facility-icon">
            <Building2 size={25} strokeWidth={1.4} />
          </div>
          <h3>City General Hospital</h3>
          <span className="profile-type">HOSPITAL NETWORK</span>
          <p>
            <MapPin size={14} /> Bengaluru, India
          </p>
          <div className="profile-divider" />
          <div className="profile-blood">
            <span>Current request</span>
            <strong>
              O<span>+</span>
            </strong>
            <span>2 units needed</span>
          </div>
          <div className="preview-request-label">
            <Radio size={13} /> Matching nearby donors
          </div>
        </aside>
        <div className="preview-main">
          <div className="preview-toolbar">
            <div
              className="preview-tabs"
              role="tablist"
              aria-label="Network preview views"
            >
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  id={`preview-tab-${id}`}
                  role="tab"
                  aria-selected={active === id}
                  aria-controls={`preview-panel-${id}`}
                  onClick={() => setActive(id)}
                  onKeyDown={(event) => {
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    )
                      return;
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? tabs.length - 1
                          : (tabs.findIndex((t) => t.id === active) +
                              (event.key === "ArrowRight" ? 1 : -1) +
                              tabs.length) %
                            tabs.length;
                    setActive(tabs[next].id);
                    document
                      .getElementById(`preview-tab-${tabs[next].id}`)
                      ?.focus();
                  }}
                  tabIndex={active === id ? 0 : -1}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
            <span className="preview-period">This week</span>
          </div>
          <div
            key={active}
            className="preview-tab-panel"
            id={`preview-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`preview-tab-${active}`}
            tabIndex={0}
          >
            {active === "overview" && (
              <>
                <div className="preview-metrics">
                  <div>
                    <span>Nearby donors</span>
                    <strong>
                      <AnimatedNumber value={18} />
                      <span> donors</span>
                    </strong>
                    <small>
                      <MapPin size={11} /> Within 10 km
                    </small>
                  </div>
                  <div>
                    <span>Compatible matches</span>
                    <strong>
                      <AnimatedNumber value={8} pad={2} />
                    </strong>
                    <small>Matched to your request</small>
                  </div>
                  <div>
                    <span>Requests fulfilled</span>
                    <strong>
                      <AnimatedNumber value={24} />
                    </strong>
                    <small>This month</small>
                  </div>
                </div>
                <div className="preview-chart">
                  <div className="chart-heading">
                    <span>Connections over time</span>
                    <span className="chart-legend">
                      <i /> Donor responses
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 680 118"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Sample donor response trend increasing through the week"
                  >
                    <defs>
                      <linearGradient
                        id="preview-chart-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#00b1ff"
                          stopOpacity=".2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#00b1ff"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <g stroke="#4846c6" strokeWidth=".6" strokeDasharray="3 5">
                      <path d="M0 24H680M0 64H680M0 104H680" />
                    </g>
                    <path
                      d="M0 92C30 92 36 73 67 77S114 111 143 87 189 75 214 67 239 82 265 69 294 30 321 50 351 69 381 40 418 61 454 38 482 35 502 29 531 51 556 25 588 39 609 16 649 33 680 8V118H0Z"
                      fill="url(#preview-chart-fill)"
                    />
                    <path
                      className="preview-chart-line"
                      pathLength="1"
                      d="M0 92C30 92 36 73 67 77S114 111 143 87 189 75 214 67 239 82 265 69 294 30 321 50 351 69 381 40 418 61 454 38 482 35 502 29 531 51 556 25 588 39 609 16 649 33 680 8"
                      fill="none"
                      stroke="#00b1ff"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="chart-axis">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <span key={day}>{day}</span>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
            {active === "matches" && (
              <div className="preview-donors">
                <p>Compatible donors, closer to care.</p>
                {[
                  { name: "Donor 01", type: "O+", distance: "1.2" },
                  { name: "Donor 02", type: "O−", distance: "2.4" },
                  { name: "Donor 03", type: "O+", distance: "3.1" },
                ].map((d) => (
                  <div className="preview-donor-row" key={d.name}>
                    <span className="donor-type">{d.type}</span>
                    <div>
                      <strong>{d.name}</strong>
                      <small>Compatible blood group</small>
                    </div>
                    <span>
                      <MapPin size={13} />
                      {d.distance} km
                    </span>
                    <Check size={16} />
                  </div>
                ))}
              </div>
            )}
            {active === "activity" && (
              <div className="preview-activity">
                <p>Every connection moves care forward.</p>
                {[
                  {
                    title: "Blood request created",
                    detail: "O+ · 2 units · City General Hospital",
                    time: "09:30",
                  },
                  {
                    title: "Compatible donors identified",
                    detail: "8 matches within the local network",
                    time: "09:31",
                  },
                  {
                    title: "Donor response received",
                    detail: "The hospital can now coordinate a donation",
                    time: "09:34",
                  },
                ].map((item, i) => (
                  <div key={item.title}>
                    <span className="activity-step">{i + 1}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </div>
                    <time>{item.time}</time>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="preview-bottom">
        <span>
          <Droplet size={13} /> A connected view. A more human outcome.
        </span>
        <button onClick={onJoin}>
          Join the network <ArrowUpRight size={14} />
        </button>
      </div>
    </section>
  );
}
