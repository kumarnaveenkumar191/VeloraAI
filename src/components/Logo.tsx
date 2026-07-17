import type { SVGProps } from "react";

export function Logo({ size = 36, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VELORA"
      {...props}
    >
      <defs>
        <linearGradient id="velora-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5b7" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="velora-gold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#velora-grad)" />
      {/* Abstract V + paper plane */}
      <path
        d="M12 14 L24 36 L36 14"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M30 12 L38 16 L31 19 L29 26 L26 19 Z"
        fill="url(#velora-gold)"
        stroke="white"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="36" r="2" fill="url(#velora-gold)" />
    </svg>
  );
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <Logo size={36} />
      <span className="text-xl">VELORA</span>
    </span>
  );
}