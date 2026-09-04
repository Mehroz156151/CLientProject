export default function Badge({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 3L42 10V22C42 33.2 34.6 41.6 24 45C13.4 41.6 6 33.2 6 22V10L24 3Z"
        fill="#0f2350"
        stroke="#2f5aa8"
        strokeWidth="1.5"
      />
      <path
        d="M24 8L37 13V22C37 30.7 31.6 37.3 24 40C16.4 37.3 11 30.7 11 22V13L24 8Z"
        fill="#16223f"
      />
      <path
        d="M24 13L24 40"
        stroke="#c8322d"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle cx="24" cy="22" r="7" fill="none" stroke="#e2c04d" strokeWidth="1.5" />
      <path d="M24 17L26 21H22L24 17Z" fill="#e2c04d" />
      <path d="M20 27L28 27L24 33Z" fill="#e2c04d" opacity="0.9" />
    </svg>
  );
}
