import styled from "styled-components";

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchBox = styled.div`
  position: relative;
  flex: 1;
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const TableSearchInput = styled.input`
  width: 100%;
  padding: 7px 12px 7px 32px;
  font-size: 12.5px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FilterBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 4px 10px;
  svg {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const FilterSelect = styled.select`
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  outline: none;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
`;
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const TableHeader = styled.th<{ $align?: "left" | "right" }>`
  padding: 10px 14px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  text-align: ${({ $align }) => $align || "left"};
`;

export const TableRow = styled.tr`
  &:hover td {
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  }
`;

export const TableCell = styled.td<{ $align?: "left" | "right" }>`
  padding: 12px 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  vertical-align: middle;
  text-align: ${({ $align }) => $align || "left"};
`;

export const InvoiceBlock = styled.div`
  display: flex;
  flex-direction: column;
`;
export const InvoiceNumber = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-weight: 700;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const CustomerTypeBadge = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const CustomerName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ItemsSummaryWrap = styled.div`
  max-width: 260px;
`;

export const ItemsText = styled.span`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ItemsCount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const AmountBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TotalAmount = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-feature-settings: "tnum";
`;

export const PaidAmount = styled.span`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const PaymentMethodRow = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const DateBlock = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const TimeText = styled.span`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ActionIconButton = styled.button`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const EmptyMessage = styled.td`
  text-align: center;
  padding: 36px 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

export const HeaderLinkButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radius.sm};
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;
