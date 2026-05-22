import { cn } from "../../lib/cn";
import { playlixLogoSrc } from "../../lib/brand/playlix-logo";

type PlaylixLogoProps = {
  className?: string;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "size-16",
  md: "size-20",
} as const;

const sizePixels = {
  sm: 64,
  md: 80,
} as const;

export function PlaylixLogo({ className, size = "sm" }: PlaylixLogoProps) {
  const pixelSize = sizePixels[size];

  return (
    <span className={cn("playlix-logo-slot", sizeClasses[size], className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Playlix"
        className="playlix-logo playlix-logo-image"
        height={pixelSize}
        src={playlixLogoSrc}
        width={pixelSize}
      />
    </span>
  );
}
