interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * HealthCompare logo: a rounded healthcare cross paired with two comparison
 * bars, rendered inline so it inherits currentColor and scales crisply.
 */
export function Logo({ className, showWordmark = true, wordmarkClassName }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        role="img"
        aria-label="HealthCompare logo"
      >
        <rect x="1" y="1" width="30" height="30" rx="8" className="fill-primary" />
        <path
          d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7z"
          fill="oklch(0.985 0.004 240)"
        />
        <rect x="20.5" y="17" width="2.5" height="7" rx="1" className="fill-teal" />
        <rect x="24.5" y="14" width="2.5" height="10" rx="1" className="fill-teal" />
      </svg>
      {showWordmark && (
        <span className={`text-[15px] font-semibold tracking-tight ${wordmarkClassName ?? ""}`}>
          Health<span className="text-primary">Compare</span>
        </span>
      )}
    </span>
  );
}
