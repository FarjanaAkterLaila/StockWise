import React from "react";
import { BadgeContainer, BadgeDot } from "./Badge.styles";
import type { BadgeVariant, BadgeSize } from "@/types";
import { BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";

export type { BadgeVariant };

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = BADGE_VARIANTS.NEUTRAL,
  size = UI_SIZES.MD,
  dot = false,
  className,
}) => {
  return (
    <BadgeContainer $variant={variant} $size={size} className={className}>
      {dot && <BadgeDot />}
      {children}
    </BadgeContainer>
  );
};
