import styled from "styled-components";

export const SegmentedContainer = styled.div<{
  $total: number;
  $size: "sm" | "md";
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  padding: 3px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  user-select: none;
  box-sizing: border-box;
`;

export const SlidingIndicator = styled.div<{
  $activeIndex: number;
  $total: number;
}>`
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / ${({ $total }) => $total});
  transform: translateX(calc(${({ $activeIndex }) => $activeIndex} * 100%));
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  pointer-events: none;
  z-index: 1;
`;

export const SegmentButton = styled.button<{
  $isActive: boolean;
  $size: "sm" | "md";
}>`
  position: relative;
  z-index: 2;
  flex: 1;
  background: transparent;
  border: none;
  padding: ${({ $size }) => ($size === "sm" ? "4px 10px" : "5px 12px")};
  font-size: ${({ $size }) => ($size === "sm" ? "11.5px" : "12px")};
  font-weight: 600;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textSecondary};
  cursor: pointer;
  white-space: nowrap;
  line-height: 1.4;
  outline: none;
  text-align: center;
  transition: color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus-visible {
    outline: none;
  }
`;
