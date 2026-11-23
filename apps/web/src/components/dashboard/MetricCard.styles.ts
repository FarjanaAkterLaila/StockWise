import styled from "styled-components";

export const CardWrap = styled.div<{ $metricId: string }>`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const CardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MetricTitle = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const IconBox = styled.div<{ $metricId: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $metricId, theme }) => {
    switch ($metricId) {
      case "sales_count":
        return `
          background-color: ${theme.colors.successLight};
          color: ${theme.colors.success};
        `;
      case "total_purchase":
      case "inventory_value":
        return `
          background-color: ${theme.colors.infoLight};
          color: ${theme.colors.info};
        `;
      case "low_stock":
        return `
          background-color: ${theme.colors.warningLight};
          color: ${theme.colors.warning};
        `;
      case "revenue":
      default:
        return `
          background-color: ${theme.colors.primaryLight};
          color: ${theme.colors.primary};
        `;
    }
  }}
`;

export const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 14px 0 10px;
`;

export const MetricValue = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.5px;
  font-feature-settings: "tnum";
`;

export const StatusPill = styled.span<{ $isPositive: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ $isPositive, theme }) =>
    $isPositive ? theme.colors.successLight : theme.colors.warningLight};
  color: ${({ $isPositive, theme }) =>
    $isPositive ? theme.colors.success : theme.colors.warning};
`;

export const FooterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
`;

export const TrendBadge = styled.span<{ $isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
  color: ${({ $isPositive, theme }) =>
    $isPositive ? theme.colors.success : theme.colors.danger};
`;

export const PeriodLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;
