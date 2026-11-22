import React from 'react';
import { BadgeContainer, BadgeDot } from './Badge.styles';
import type { BadgeVariant } from './Badge.styles';

export type { BadgeVariant };

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
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
