import styled from "styled-components";
import type { ModalSize, ModalVariant } from "@/types";

export const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity 0.2s ease;
`;

export const Dialog = styled.div<{ $size?: ModalSize }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadows.modal};
  width: 100%;
  max-width: ${({ $size }) =>
    $size === "sm" ? "440px" : $size === "lg" ? "860px" : "560px"};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Title = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.3px;
`;

export const Subtitle = styled.p`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  padding: 6px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const Body = styled.div`
  padding: 22px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

export const Message = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ConfirmBtn = styled.button<{ $variant?: ModalVariant }>`
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textInverse};
  background-color: ${({ $variant, theme }) =>
    $variant === "danger" ? theme.colors.danger : theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${({ $variant, theme }) =>
      $variant === "danger"
        ? theme.colors.dangerHover
        : theme.colors.primaryHover};
  }
`;

export const CancelBtn = styled.button`
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
  }
`;
