import styled, { css } from "styled-components";
import type { BadgeVariant, BadgeSize } from "@/types";

export type { BadgeVariant };

interface BadgeContainerProps {
  $variant: BadgeVariant;
  $size: BadgeSize;
}

const variantStyles = {
  success: css`
    background-color: ${({ theme }) => theme.colors.successLight};
    color: ${({ theme }) => theme.colors.success};
    border: 1px solid ${({ theme }) => theme.colors.successBorder};
  `,
  warning: css`
    background-color: ${({ theme }) => theme.colors.warningLight};
    color: ${({ theme }) => theme.colors.warning};
    border: 1px solid ${({ theme }) => theme.colors.warningBorder};
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.dangerLight};
    color: ${({ theme }) => theme.colors.danger};
    border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  `,
  info: css`
    background-color: ${({ theme }) => theme.colors.infoLight};
    color: ${({ theme }) => theme.colors.info};
    border: 1px solid ${({ theme }) => theme.colors.infoBorder};
  `,
  primary: css`
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
  `,
  neutral: css`
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
    color: ${({ theme }) => theme.colors.textSecondary};
    border: 1px solid ${({ theme }) => theme.colors.border};
  `,
};

export const BadgeContainer = styled.span<BadgeContainerProps>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;

  ${({ $size }) =>
    $size === "sm"
      ? css`
          font-size: 10.5px;
          padding: 1px 6px;
        `
      : css`
          font-size: 11.5px;
          padding: 2px 8px;
        `}

  ${({ $variant }) => variantStyles[$variant]}
`;

export const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
`;
