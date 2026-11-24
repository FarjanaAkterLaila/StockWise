import styled, { keyframes, css } from "styled-components";

const slideIn = keyframes`
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
`;

export const ToastContainerWrap = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
`;

export const ToastCard = styled.div<{
  $type: "success" | "error" | "warning" | "info";
  $isDismissing?: boolean;
}>`
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  min-width: 320px;
  max-width: 420px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #111827;
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6),
    0 8px 10px -6px rgba(0, 0, 0, 0.4);
  animation: ${({ $isDismissing }) =>
    $isDismissing
      ? css`
          ${fadeOut} 0.25s forwards cubic-bezier(0.4, 0, 0.2, 1)
        `
      : css`
          ${slideIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1)
        `};

  ${({ $type }) => {
    switch ($type) {
      case "success":
        return css`
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-left: 4px solid #10b981;
        `;
      case "error":
        return css`
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-left: 4px solid #ef4444;
        `;
      case "warning":
        return css`
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-left: 4px solid #f59e0b;
        `;
      case "info":
      default:
        return css`
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-left: 4px solid #3b82f6;
        `;
    }
  }}
`;

export const ToastIconWrap = styled.div<{
  $type: "success" | "error" | "warning" | "info";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  margin-top: 1px;
  flex-shrink: 0;

  ${({ $type }) => {
    switch ($type) {
      case "success":
        return css`
          color: #10b981;
        `;
      case "error":
        return css`
          color: #ef4444;
        `;
      case "warning":
        return css`
          color: #f59e0b;
        `;
      case "info":
      default:
        return css`
          color: #3b82f6;
        `;
    }
  }}
`;

export const ToastBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const ToastTitle = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: #f9fafb;
  line-height: 1.3;
`;

export const ToastMessage = styled.div`
  font-size: 12.5px;
  color: #9ca3af;
  margin-top: 3px;
  line-height: 1.4;
  word-break: break-word;
`;

export const ToastCloseBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 2px;
  margin-left: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    color: #f3f4f6;
    background: rgba(255, 255, 255, 0.08);
  }
`;
