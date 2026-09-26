import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Download } from "lucide-react";
import Brand from "./Brand";
import Modal from "./Modal";

export default function HeroCardModal({ show, onClose, achievementData }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  if (!show || !achievementData) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `pulsenode-${(achievementData.donorName || "donor").replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download image:", err);
      setError("We couldn’t save your card. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      titleId="achievement-title"
      className="achievement-modal"
    >
      <div ref={cardRef} className="achievement-card">
        <Brand compact />
        <div className="achievement-type">{achievementData.bloodType}</div>
        <span className="eyebrow">A MOMENT THAT MATTERS</span>
        <h2 id="achievement-title">
          A little of me.
          <br />
          <span>A gift of hope.</span>
        </h2>
        <p>
          {achievementData.donorName || "A PulseNode donor"} donated{" "}
          {achievementData.units}{" "}
          {achievementData.units === 1 ? "unit" : "units"} of{" "}
          {achievementData.bloodType} blood.
          <br />
          {achievementData.totalDonations} donations. A growing story of care.
        </p>
        <small>Connected by care · {new Date().getFullYear()}</small>
      </div>
      {error && (
        <p role="alert" className="form-message">
          {error}
        </p>
      )}
      <button
        className="button button-primary"
        onClick={handleDownload}
        disabled={downloading}
      >
        <Download size={18} />
        {downloading ? "Preparing your card…" : "Save your giving card"}
      </button>
    </Modal>
  );
}
