import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
`;

export const LoaderContainer = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  min-height: ${({ $fullScreen }) => ($fullScreen ? "100vh" : "240px")};
  background-color: ${({ $fullScreen, theme }) =>
    $fullScreen ? theme.colors.backgroundSubtle : "transparent"};
  padding: 24px;
  box-sizing: border-box;
`;

export const SpinnerWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SpinnerRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.full};
  border: 3px solid ${({ theme }) => theme.colors.primaryLight};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.85s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
  box-sizing: border-box;
`;

export const SpinnerIconWrap = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  animation: ${pulse} 1.6s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoaderText = styled.p`
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  letter-spacing: -0.1px;
`;

export const LoaderSubtext = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: -8px;
`;
