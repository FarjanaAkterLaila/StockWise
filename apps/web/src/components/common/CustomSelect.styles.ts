import styled from "styled-components";

export const SelectContainer = styled.div<{
  $minWidth?: string;
  $fullWidth?: boolean;
}>`
  position: relative;
  display: ${({ $fullWidth }) => ($fullWidth ? "block" : "inline-block")};
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "fit-content")};
  max-width: 100%;
  min-width: ${({ $minWidth }) => $minWidth || "0"};
  box-sizing: border-box;
`;

export const SelectTrigger = styled.button<{
  $isOpen: boolean;
  $fullWidth?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  min-width: 0;
  box-sizing: border-box;
  background-color: ${({ $fullWidth, theme }) =>
    $fullWidth ? theme.colors.background : theme.colors.backgroundSubtle};
  border: 1px solid
    ${({ $isOpen, theme }) =>
      $isOpen ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ $fullWidth }) => ($fullWidth ? "9px 13px" : "7px 12px")};
  font-size: ${({ $fullWidth }) => ($fullWidth ? "13px" : "12.5px")};
  font-weight: ${({ $fullWidth }) => ($fullWidth ? "500" : "600")};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  white-space: nowrap;
  box-shadow: ${({ $fullWidth }) =>
    $fullWidth ? "0 1px 2px rgba(15, 23, 42, 0.04)" : "none"};

  &:hover {
    background-color: ${({ $fullWidth, theme }) =>
      $fullWidth ? theme.colors.background : theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryFocusRing};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const TriggerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  overflow: hidden;

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
    flex-shrink: 0;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
`;

export const ChevronWrap = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const DropdownMenu = styled.div<{
  $align?: "left" | "right";
  $fullWidth?: boolean;
}>`
  position: absolute;
  top: calc(100% + 5px);
  ${({ $align }) => ($align === "right" ? "right: 0;" : "left: 0;")}
  min-width: 100%;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "max-content")};
  max-width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "min(420px, 90vw)")};
  max-height: 240px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow:
    0 10px 25px -5px rgba(15, 23, 42, 0.16),
    0 8px 10px -6px rgba(15, 23, 42, 0.08);
  padding: 5px;
  z-index: 150;
  box-sizing: border-box;
  animation: dropdownFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const OptionItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 11px;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 12.5px;
  font-weight: ${({ $isSelected }) => ($isSelected ? 700 : 500)};
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : theme.colors.textPrimary};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primaryLight : "transparent"};
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    background-color: ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primaryLight : theme.colors.backgroundSubtle};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const OptionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const StatusDot = styled.span<{ $color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  box-shadow: 0 0 5px ${({ $color }) => $color}66;
  flex-shrink: 0;
`;
