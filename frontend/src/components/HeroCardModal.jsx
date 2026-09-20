import React, { useRef } from "react";
import * as htmlToImage from "html-to-image";
import { Download, X } from "lucide-react";

export default function HeroCardModal({ show, onClose, achievementData }) {
  const cardRef = useRef(null);

  if (!show || !achievementData) return null;

  const handleDownload = async () => {
    try {
      if (cardRef.current) {
        const dataUrl = await htmlToImage.toPng(cardRef.current, {
          quality: 1.0,
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        const nameStr = achievementData.donorName
          ? achievementData.donorName
          : "hero";
        link.download = `pulsenode-${nameStr.replace(/\s+/g, "-").toLowerCase()}.png`;
        document.body.appendChild(link); // Required in some browsers
        link.click();
        document.body.removeChild(link); // Clean up
      }
    } catch (err) {
      console.error("Failed to download image:", err);
      alert("Failed to generate image. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-zinc-400 hover:text-white transition"
        >
          <X className="w-8 h-8" />
        </button>

        {/* The Card to be captured */}
        <div
          ref={cardRef}
          className="w-full bg-gradient-to-br from-zinc-900 to-black border-2 border-lime-400 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(212,247,112,0.2)] overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-400 via-transparent to-transparent pointer-events-none"></div>

          <div className="w-20 h-20 bg-lime-400/20 text-lime-400 rounded-full flex items-center justify-center mb-6 border border-lime-400/50 shadow-[0_0_20px_rgba(212,247,112,0.4)]">
            <span className="text-4xl font-black">
              {achievementData.bloodType}
            </span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            I saved {achievementData.units * 3} lives today.
          </h2>

          <p className="text-zinc-400 text-sm font-medium mb-8 leading-relaxed">
            I just donated {achievementData.units}{" "}
            {achievementData.units === 1 ? "unit" : "units"} of{" "}
            {achievementData.bloodType} blood. That's{" "}
            {achievementData.totalDonations} total donations on PulseNode!
          </p>

          <div className="w-full bg-zinc-800/50 rounded-2xl p-4 flex items-center justify-between border border-zinc-700/50 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                P
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm leading-none">
                  PulseNode
                </p>
                <p className="text-zinc-500 text-xs">pulse-node.vercel.app</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lime-400 font-black text-lg leading-none">
                {new Date().getFullYear()}
              </p>
              <p className="text-zinc-500 text-xs font-bold uppercase">Hero</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleDownload}
          className="mt-8 flex items-center justify-center space-x-2 bg-lime-400 hover:bg-lime-300 text-black px-6 py-4 rounded-2xl font-extrabold w-full transition shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Save Image to Share</span>
        </button>
      </div>
    </div>
  );
}
