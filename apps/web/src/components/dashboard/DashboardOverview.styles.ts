import styled from "styled-components";

export const DashboardViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const DashboardTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const DashboardSubNote = styled.span`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const DashboardRefreshBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DashboardErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  background-color: ${({ theme }) => theme.colors.dangerLight};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13.5px;
  flex-wrap: wrap;
`;

export const MetricsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  min-width: 0;

  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

export const AnalyticsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
  min-width: 0;

  ${({ theme }) => theme.media.mobile} {
    gap: 14px;
    margin-bottom: 16px;
  }
`;

export const ChartsRowTop = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  min-width: 0;

  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: minmax(0, 1fr);
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: minmax(0, 1fr);
  }

  ${({ theme }) => theme.media.mobile} {
    gap: 14px;
  }
`;

export const RecentSalesSection = styled.section`
  margin-bottom: 24px;
  min-width: 0;
`;
