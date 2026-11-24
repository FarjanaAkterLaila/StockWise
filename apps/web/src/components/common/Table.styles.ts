import styled from "styled-components";

export const TableContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;
`;

export const TableResponsiveWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  text-align: left;
`;

export const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const HeaderRow = styled.tr``;

export const TableHeader = styled.th<{ $align?: "left" | "center" | "right" }>`
  padding: 12px 16px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: ${({ $align }) => $align || "left"};
  white-space: nowrap;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td<{ $align?: "left" | "center" | "right" }>`
  padding: 14px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: ${({ $align }) => $align || "left"};
  vertical-align: middle;
`;

export const TableFooterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  box-sizing: border-box;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
  }
`;

export const FooterCountText = styled.span`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 700;
  }
`;

export const ActiveFilterBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radius.full};
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
`;

export const EmptyIconWrap = styled.div`
  width: 54px;
  height: 54px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px dashed ${({ theme }) => theme.colors.borderDashed};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 12px;
`;

export const EmptyTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
`;

export const EmptyDesc = styled.p`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 380px;
  margin-bottom: 16px;
`;

export const ClearFilterBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textInverse};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

export const ActionBtn = styled.button<{
  $variant?: "view" | "edit" | "delete";
}>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ $variant, theme }) =>
    $variant === "delete"
      ? theme.colors.danger
      : theme.colors.textSecondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ $variant, theme }) =>
      $variant === "delete"
        ? theme.colors.dangerLight
        : theme.colors.hoverSubtle};
    border-color: ${({ $variant, theme }) =>
      $variant === "delete"
        ? theme.colors.dangerBorder
        : theme.colors.hoverBorder};
    color: ${({ $variant, theme }) =>
      $variant === "delete"
        ? theme.colors.dangerHover
        : theme.colors.primary};
  }
`;
