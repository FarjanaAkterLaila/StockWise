import styled from "styled-components";

export const DashboardViewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MetricsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const AnalyticsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

export const ChartsRowTop = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
  }
`;

export const RecentSalesSection = styled.section`
  margin-bottom: 24px;
`;
