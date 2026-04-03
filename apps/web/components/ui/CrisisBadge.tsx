import type { CrisisLevel } from "@recoveryos/shared";

interface CrisisBadgeProps {
  level: CrisisLevel;
}

const styles: Record<CrisisLevel, string> = {
  NONE: "bg-gray-100 text-gray-600",
  LOW: "bg-yellow-100 text-yellow-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-600 text-white animate-pulse",
};

export function CrisisBadge({ level }: CrisisBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>
      {level}
    </span>
  );
}
