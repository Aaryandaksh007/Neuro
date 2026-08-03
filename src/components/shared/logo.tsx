import { cn } from "@/lib/utils";

export function NeuroTwinLogo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="NeuroTwin OS logo"
    >
      <defs>
        <linearGradient id="nt-orb" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="oklch(0.78 0.12 155)" />
          <stop offset="0.55" stopColor="oklch(0.7 0.11 180)" />
          <stop offset="1" stopColor="oklch(0.74 0.1 330)" />
        </linearGradient>
        <radialGradient id="nt-glow" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* outer soft ring */}
      <circle cx="24" cy="24" r="22" fill="url(#nt-orb)" opacity="0.18" />
      {/* brain-twin orb */}
      <path
        d="M24 6c-7 0-12 5-12 11 0 3 1.4 5.6 3.6 7.4C15 26 14 28 14 30.5 14 36 18.5 40 24 40s10-4 10-9.5c0-2.5-1-4.5-1.6-6.1C34.6 22.6 36 20 36 17c0-6-5-11-12-11z"
        fill="url(#nt-orb)"
      />
      {/* twin connection lines */}
      <path
        d="M18 18c2-2 4-2 6 0s4 2 6 0M18 24c2-2 4-2 6 0s4 2 6 0M18 30c2-2 4-2 6 0s4 2 6 0"
        stroke="white"
        strokeOpacity="0.85"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="17.5" cy="14" r="3" fill="url(#nt-glow)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      NeuroTwin<span className="text-primary"> OS</span>
    </span>
  );
}
