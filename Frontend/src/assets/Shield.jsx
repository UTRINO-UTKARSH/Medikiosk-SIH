const ShieldInfoIcon = ({  color = "#02162c" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z"
      fill={color}
    />
    <circle cx="12" cy="8.5" r="1.1" fill="white" />
    <rect x="11" y="11" width="2" height="6" rx="1" fill="white" />
  </svg>
);

export default ShieldInfoIcon;