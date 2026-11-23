import styled from "styled-components";

export const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
`;

export const CardHeader = styled.div`
  padding: 18px 22px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderCard};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.2px;
`;

export const CardSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

export const CardAction = styled.div`
  display: flex;
  align-items: center;
`;

export const CardBody = styled.div`
  padding: 20px 22px;
  flex: 1;
`;
