import styled from "styled-components";
import type { ModalSize, ModalVariant } from "@/types";

export const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  ${({ theme }) => theme.media.mobile} {
    padding: 8px;
  }

  @media print {
    position: static;
    background: transparent;
    backdrop-filter: none;
    padding: 0;
    margin: 0 auto;
    opacity: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: auto;
    min-height: 0;
    overflow: visible;
  }
`;

export const Dialog = styled.div<{ $size?: ModalSize }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow:
    0 20px 50px rgba(15, 23, 42, 0.22),
    0 0 0 1px rgba(15, 23, 42, 0.06);
  width: 100%;
  max-width: ${({ $size }) =>
    $size === "sm" ? "440px" : $size === "lg" ? "860px" : "580px"};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  ${({ theme }) => theme.media.mobile} {
    max-height: 94vh;
    border-radius: ${({ theme }) => theme.radius.lg};
  }

  @keyframes modalScaleIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media print {
    position: static;
    box-shadow: none;
    border: none;
    max-width: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-height: none;
    height: auto;
    overflow: visible;
    background: transparent;
    animation: none;
    margin: 0 auto;
    padding: 0;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: 16px;

  ${({ theme }) => theme.media.mobile} {
    padding: 14px 16px;
  }

  @media print {
    display: none;
  }
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

  ${({ theme }) => theme.media.mobile} {
    font-size: 16px;
  }
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
  flex-shrink: 0;
  margin-top: -2px;
  margin-right: -4px;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media print {
    display: none;
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

  ${({ theme }) => theme.media.mobile} {
    padding: 14px 16px;
  }

  @media print {
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow: visible;
    height: auto;
    max-height: none;
  }
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

  ${({ theme }) => theme.media.mobile} {
    padding: 12px 16px;
    gap: 8px;
    flex-wrap: wrap;
  }

  @media print {
    display: none;
  }
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

  ${({ theme }) => theme.media.mobile} {
    flex: 1;
    text-align: center;
    justify-content: center;
    min-width: 100px;
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

  ${({ theme }) => theme.media.mobile} {
    flex: 1;
    text-align: center;
    justify-content: center;
    min-width: 100px;
  }
`;
