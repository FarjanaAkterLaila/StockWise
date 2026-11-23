import styled from "styled-components";

export const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
`;

export const MainContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: ${({ theme }) => theme.colors.backgroundApp};
`;

export const ScrollableContent = styled.main`
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;

  ${({ theme }) => theme.media.tablet} {
    padding: 20px;
  }
`;

export const PageContainer = styled.div`
  max-width: 1520px;
  margin: 0 auto;
`;
