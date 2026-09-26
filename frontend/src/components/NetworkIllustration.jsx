export default function NetworkIllustration() {
  return (
    <svg
      className="network-illustration motion-loop"
      viewBox="0 0 440 450"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          className="orbital-grid motion-loop"
          cx="212"
          cy="217"
          r="183"
          opacity=".3"
          strokeDasharray="3 9"
        />
        <circle cx="212" cy="217" r="145" opacity=".13" />
        <circle
          className="orbital-signal motion-loop"
          cx="212"
          cy="217"
          r="183"
          pathLength="100"
        />
        <circle
          className="orbital-signal orbital-signal-inner motion-loop"
          cx="212"
          cy="217"
          r="145"
          pathLength="100"
        />
        <circle className="radar-echo motion-loop" cx="212" cy="217" r="100" />
        <circle
          className="radar-echo radar-echo-delayed motion-loop"
          cx="212"
          cy="217"
          r="100"
        />
        <path
          d="M47 175v-62a20 20 0 0 1 20-20h99M321 99h39a20 20 0 0 1 20 20v91M349 308v59a20 20 0 0 1-20 20H175"
          opacity=".6"
          strokeDasharray="4 6"
        />
        <g transform="translate(17 2) rotate(-13 72 81)">
          <rect x="43" y="34" width="86" height="114" rx="15" />
          <rect x="54" y="49" width="64" height="47" rx="7" />
          <path d="M62 75h9l5-11 8 22 7-15 4 4h15M75 119h22M86 108v22" />
          <path d="M86 148v14c0 23 31 25 31 47" opacity=".6" />
        </g>
        <g transform="translate(130 31)">
          <path
            d="M144 13v41c0 40 57 40 57 0V13M139 14h11M196 14h11"
            strokeWidth="2"
          />
          <path d="M151 15v39c0 29 43 29 43 0V15M173 82v15c0 23 28 28 43 15 12-10 10-28 1-35" />
          <circle cx="213" cy="69" r="11" />
          <circle cx="213" cy="69" r="6" />
        </g>
        <g transform="translate(42 158) rotate(-7 150 100)">
          <rect x="44" y="8" width="246" height="164" rx="13" />
          <rect x="55" y="20" width="224" height="133" rx="7" />
          <path d="M44 172 11 211a5 5 0 0 0 4 8h308a5 5 0 0 0 4-8l-37-39M121 202h93M25 205h289" />
          <circle cx="167" cy="162" r="2" />
          <path
            d="M66 91h31l12-18 14 35 18-65 18 87 13-39h22l11-17 13 17h48"
            opacity=".2"
          />
          <path
            className="illustration-pulse motion-loop"
            pathLength="1"
            d="M66 91h31l12-18 14 35 18-65 18 87 13-39h22l11-17 13 17h48"
            strokeWidth="1.8"
          />
          <path
            d="M69 35h32M250 35h13M69 138h30M107 138h14M246 138h16"
            opacity=".5"
          />
        </g>
        <g transform="translate(2 301) rotate(9 60 60)">
          <path d="M40 16h33v17l19 17v71a9 9 0 0 1-9 9H30a9 9 0 0 1-9-9V50l19-17V16Z" />
          <path d="M36 8h41v13H36zM21 57h71M21 112h71M44 80h25M56 68v25M56 130v11" />
        </g>
        <g transform="translate(322 277)">
          <path d="M45 0C34 17 9 34 9 55a36 36 0 0 0 72 0C81 34 56 17 45 0Z" />
          <path d="M25 57h11l7-16 9 30 7-14h8" strokeWidth="1.7" />
        </g>
        <circle cx="172" cy="95" r="4" />
        <circle cx="378" cy="218" r="4" />
        <circle cx="166" cy="387" r="4" />
        <path
          d="M387 145h12M393 139v12M112 425h12M118 419v12M26 257h8M30 253v8"
          opacity=".55"
        />
      </g>
    </svg>
  );
}
