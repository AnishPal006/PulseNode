const nodes = [
  [44, 150],
  [178, 82],
  [310, 174],
  [450, 70],
  [602, 168],
  [60, 378],
  [214, 310],
  [362, 428],
  [518, 318],
  [688, 410],
  [114, 608],
  [288, 554],
  [456, 664],
  [634, 566],
  [796, 640],
  [876, 108],
  [1014, 216],
  [1178, 108],
  [1352, 218],
  [904, 402],
  [1080, 342],
  [1242, 454],
  [1412, 368],
];

/** Decorative signal field. All motion is CSS-driven and can be paused. */
export default function MotionBackdrop() {
  return (
    <div className="motion-backdrop" aria-hidden="true">
      <div className="aurora aurora-one motion-loop" />
      <div className="aurora aurora-two motion-loop" />
      <div className="hero-grid motion-loop" />
      <div className="pointer-light" />
      <svg
        className="signal-field"
        viewBox="0 0 1440 760"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="signal-mesh">
          <path d="M44 150 178 82 310 174 450 70 602 168M60 378 214 310 362 428 518 318 688 410M114 608 288 554 456 664 634 566 796 640M44 150 60 378 114 608M178 82 214 310 288 554M310 174 362 428 456 664M450 70 518 318 634 566M602 168 688 410 796 640M876 108 1014 216 1178 108 1352 218M904 402 1080 342 1242 454 1412 368M876 108 904 402M1014 216 1080 342M1178 108 1242 454M1352 218 1412 368" />
        </g>
        <path
          className="signal-stream motion-loop"
          pathLength="100"
          d="M44 150 178 82 310 174 362 428 518 318 634 566 796 640"
        />
        <path
          className="signal-stream signal-stream-secondary motion-loop"
          pathLength="100"
          d="M876 108 1014 216 1080 342 1242 454 1412 368"
        />
        {nodes.map(([cx, cy], i) => (
          <circle
            key={i}
            className="signal-star motion-loop"
            cx={cx}
            cy={cy}
            r={i % 3 === 0 ? 3 : 1.5}
            style={{ "--star-delay": `${i * -0.37}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
