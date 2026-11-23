import styled from "styled-components";

export const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 22px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  position: relative;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  min-height: 40px;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ChartTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.2px;
  margin: 0;
`;

export const DemoBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.full};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
`;

export const ChartSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

export const FilterButtonGroup = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  padding: 3px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  gap: 2px;
`;

export const FilterBtn = styled.button<{ $isActive: boolean }>`
  border: none;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.background : "transparent"};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  line-height: 1.4;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
  box-shadow: ${({ $isActive }) =>
    $isActive
      ? "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)"
      : "none"};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const SummaryStatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 10px 16px 14px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;
  min-height: 64px;
  align-items: center;
  box-sizing: border-box;
  overflow: visible;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    gap: 8px;
    min-height: auto;
  }
`;

export const SummaryStatItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow: visible;
`;

export const StatLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.3;
`;

export const StatValue = styled.span<{
  $colorVariant?: "primary" | "warning" | "success";
}>`
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ $colorVariant, theme }) =>
    $colorVariant === "success"
      ? theme.colors.success
      : $colorVariant === "warning"
        ? theme.colors.warning
        : theme.colors.primary};
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  line-height: 1.4;
  padding-bottom: 2px;
  overflow: visible;
`;

export const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
`;

export const LegendDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color};
`;

export const ChartCanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  animation: chartCrossfade 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes chartCrossfade {
    from {
      opacity: 0.35;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SvgContainer = styled.div`
  width: 100%;
  position: relative;
  overflow: visible;

  svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
  }
`;

export const TooltipOverlay = styled.div<{
  $x: number;
  $y: number;
  $visible: boolean;
}>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  transform: translate(-50%, -105%);
  background-color: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.textInverse};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 8px 12px;
  font-size: 11.5px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition:
    opacity 0.15s ease,
    transform 0.1s ease;
  z-index: 10;
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.textPrimary} transparent
      transparent transparent;
  }
`;

export const TooltipTitle = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 3px;
`;

export const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 2px 0;
`;

export const TooltipLabel = styled.span`
  opacity: 0.85;
`;

export const TooltipValue = styled.span<{ $highlight?: boolean }>`
  font-weight: 700;
  color: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.pulseEmerald : "inherit"};
`;
