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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
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
`;

export const DonutLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  margin-top: 8px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  ${({ theme }) => theme.media.mobile} {
    gap: 18px;
  }
`;

export const DonutVisualWrap = styled.div`
  width: 190px;
  height: 190px;
  position: relative;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    overflow: visible;
  }
`;

export const DonutCenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

export const CenterCount = styled.span`
  font-size: 26px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.5px;
  line-height: 1.1;
`;

export const CenterLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
`;

export const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  max-width: 480px;

  ${({ theme }) => theme.media.tablet} {
    max-width: 100%;
    width: 100%;
  }
`;

export const LegendCard = styled.div<{ $isActive: boolean; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.backgroundSubtle : "transparent"};
  border: 1px solid
    ${({ $isActive, $color, theme }) =>
      $isActive ? $color : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
    border-color: ${({ $color }) => $color};
    transform: translateX(2px);
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 8px 12px;
  }
`;

export const LegendLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ColorPill = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  box-shadow: 0 0 6px ${({ $color }) => $color}66;
`;

export const CategoryName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const LegendRight = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

export const ItemCount = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ItemPercentage = styled.span<{ $color: string }>`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;
