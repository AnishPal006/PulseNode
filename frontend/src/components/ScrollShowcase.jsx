import { Building2, Radio, Users, ArrowDown } from "lucide-react";
import NetworkPreview from "./NetworkPreview";

export default function ScrollShowcase({ onJoin }) {
  return (
    <section
      className="scroll-showcase"
      data-scroll-scene="showcase"
      aria-labelledby="showcase-title"
    >
      <div className="scroll-stage">
        <div className="showcase-heading">
          <p className="eyebrow">CARE, COMING TOGETHER</p>
          <h2 id="showcase-title">
            <span>Many moving parts.</span>
            <span>One connected view.</span>
          </h2>
        </div>
        <div className="showcase-composition">
          <div className="showcase-preview">
            <NetworkPreview onJoin={onJoin} />
          </div>
          <div
            className="showcase-card showcase-card-donors"
            aria-hidden="true"
          >
            <Users size={23} strokeWidth={1.5} />
            <span>Compatible donors</span>
            <strong>A match closer to home.</strong>
          </div>
          <div
            className="showcase-card showcase-card-hospitals"
            aria-hidden="true"
          >
            <Building2 size={23} strokeWidth={1.5} />
            <span>Hospital requests</span>
            <strong>Care, in one clear view.</strong>
          </div>
          <div
            className="showcase-card showcase-card-response"
            aria-hidden="true"
          >
            <Radio size={23} strokeWidth={1.5} />
            <span>Timely responses</span>
            <strong>Keep the connection moving.</strong>
          </div>
        </div>
        <div className="showcase-scroll-cue" aria-hidden="true">
          <ArrowDown size={13} /> Scroll to bring it together
          <span>
            <i />
          </span>
        </div>
      </div>
    </section>
  );
}
