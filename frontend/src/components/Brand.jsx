export default function Brand({ compact = false }) {
  return (
    <span className={`brand${compact ? " brand--compact" : ""}`}>
      <svg
        className="brand-mark"
        width="34"
        height="38"
        viewBox="0 0 34 38"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M17 3C13 9 4 16 4 23a13 13 0 0 0 26 0C30 16 21 9 17 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6 24h6l3-7 4 13 3-6h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        PulseNode<span className="brand-period">.</span>
      </span>
    </span>
  );
}
