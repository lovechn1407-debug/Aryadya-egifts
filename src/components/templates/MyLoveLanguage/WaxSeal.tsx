interface Props {
  size?: number;
}

export default function WaxSeal({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="waxGrad" cx="0.35" cy="0.35">
          <stop offset="0%" stopColor="#C62828" />
          <stop offset="60%" stopColor="#8B0000" />
          <stop offset="100%" stopColor="#4A0000" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#waxGrad)" stroke="#3D0000" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.4" />
      <path
        d="M50 68 C30 52, 30 38, 42 38 C46 38, 50 42, 50 46 C50 42, 54 38, 58 38 C70 38, 70 52, 50 68 Z"
        fill="#FFF8F0"
        opacity="0.95"
      />
    </svg>
  );
}
