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
  min-width: 0;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 14px 16px;
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

  ${({ theme }) => theme.media.mobile} {
    white-space: normal;
  }
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    margin-top: 6px;
  }
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

export const MetricHighlightRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 10px 16px 12px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 64px;
  box-sizing: border-box;
  flex-wrap: nowrap;
  gap: 10px;
  overflow: visible;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    min-height: auto;
    padding: 10px 12px;
  }
`;

export const HighlightLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  overflow: visible;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
`;

export const HighlightValue = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  line-height: 1.3;
  padding-bottom: 2px;
  overflow: visible;
`;

export const HighlightLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

export const GrowthBadge = styled.span<{ $isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ $isPositive, theme }) =>
    $isPositive ? theme.colors.success : theme.colors.danger};
  background-color: ${({ $isPositive, theme }) =>
    $isPositive ? theme.colors.successLight : theme.colors.dangerLight};
  padding: 3px 9px;
  border-radius: ${({ theme }) => theme.radius.full};
  flex-shrink: 0;
  white-space: nowrap;
`;

export const ChartCanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  user-select: none;
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
    max-width: 100%;
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
  transform: translate(-50%, -110%);
  background-color: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.textInverse};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 8px 12px;
  font-size: 11.5px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s ease;
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

export const TooltipDate = styled.div`
  font-weight: 700;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.sidebarAccent};
  margin-bottom: 3px;
`;

export const TooltipValue = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textInverse};
`;

export const TooltipSub = styled.div`
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
`;
