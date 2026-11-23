import React from "react";
import { useTheme } from "styled-components";

export interface DonutSegment {
  category: string;
  color: string;
  strokeDasharray: string;
  strokeDashoffset: number;
}

export interface DonutChartIconProps {
  size?: number;
  radius?: number;
  strokeWidth?: number;
  segments: DonutSegment[];
  activeCategory?: string | null;
  onHoverSegment?: (category: string | null) => void;
  className?: string;
}

export const DonutChartIcon: React.FC<DonutChartIconProps> = ({
  size = 180,
  radius = 78,
  strokeWidth = 24,
  segments,
  activeCategory = null,
  onHoverSegment,
  className,
}) => {
  const theme = useTheme();
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      {/* Background Track Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={theme.colors.hoverSubtle}
        strokeWidth={strokeWidth}
      />

      {/* Segments */}
      {segments.map((seg) => {
        const isSelected = activeCategory === seg.category;
        const hasSelection = Boolean(activeCategory);

        return (
          <circle
            key={seg.category}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={seg.color}
            strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
            strokeDasharray={seg.strokeDasharray}
            strokeDashoffset={seg.strokeDashoffset}
            strokeLinecap="round"
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
              opacity: hasSelection && !isSelected ? 0.35 : 1,
            }}
            onMouseEnter={() => onHoverSegment?.(seg.category)}
            onMouseLeave={() => onHoverSegment?.(null)}
          />
        );
      })}
    </svg>
  );
};
