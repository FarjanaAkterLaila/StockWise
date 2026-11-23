import styled from "styled-components";

/* 1. Module Container & Header */
export const SalesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;
export const TopActionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;
export const TitleWrap = styled.div``;
export const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.4px;
`;
export const PageSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 3px;
`;
export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const CreateSaleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 700;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows.btnPrimary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

/* 2. Sales Stats / KPI Cards */
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;
export const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;
export const StatIconBox = styled.div<{
  $colorVariant?: "primary" | "success" | "warning" | "info";
}>`
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${({ $colorVariant, theme }) =>
    $colorVariant === "success"
      ? theme.colors.successLight
      : $colorVariant === "warning"
        ? theme.colors.warningLight
        : $colorVariant === "info"
          ? theme.colors.infoLight
          : theme.colors.primaryLight};
  color: ${({ $colorVariant, theme }) =>
    $colorVariant === "success"
      ? theme.colors.success
      : $colorVariant === "warning"
        ? theme.colors.warning
        : $colorVariant === "info"
          ? theme.colors.info
          : theme.colors.primary};
`;
export const StatDetails = styled.div`
  display: flex;
  flex-direction: column;
`;
export const StatLabel = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
`;
export const StatValue = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: 2px;
`;

/* 3. Filter Bar */
export const FilterBarCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 16px 20px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
export const FilterControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
`;
export const SearchField = styled.div`
  position: relative;
  flex: 1;
  min-width: 260px;
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 42px;
  font-size: 13.5px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.shadows.focusPrimary};
  }
`;
export const FilterSelectsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;
export const SelectBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  svg {
    position: absolute;
    left: 12px;
    pointer-events: none;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
export const StyledSelect = styled.select`
  padding: 9px 32px 9px 34px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
export const ClearFilterBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;
export const ResultsCountRow = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  padding-top: 10px;
`;

/* 4. Table & Empty State */
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
`;
export const Table = styled.table`
  width: 100%;
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
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: ${({ $align }) => $align || "left"};
  white-space: nowrap;
`;
export const TableBody = styled.tbody``;
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
`;
export const EmptyIconWrap = styled.div`
  width: 52px;
  height: 52px;
  background-color: ${({ theme }) => theme.colors.hoverSubtle};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 14px;
`;
export const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
`;
export const EmptyDesc = styled.p`
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 440px;
  line-height: 1.5;
`;

/* 5. Table Row Components */
export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  vertical-align: middle;
  text-align: ${({ $align }) => $align || "left"};
`;
export const InvoiceCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;
export const InvoiceNum = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;
export const TimeText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;
export const CustomerCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;
export const CustomerNameText = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
export const CustomerMeta = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;
export const ItemsSummaryCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 220px;
`;
export const ItemsText = styled.span`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const ItemsBadge = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
`;
export const AmountBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
export const MainAmount = styled.span`
  font-size: 13.5px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
export const DueAmount = styled.span<{ $hasDue?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $hasDue, theme }) => ($hasDue ? theme.colors.danger : theme.colors.success)};
`;
export const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;
export const ActionBtn = styled.button<{
  $variant: "edit" | "delete" | "view";
}>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: ${({ $variant, theme }) =>
    $variant === "edit"
      ? theme.colors.primaryLight
      : $variant === "delete"
        ? theme.colors.dangerLight
        : theme.colors.hoverSubtle};
  color: ${({ $variant, theme }) =>
    $variant === "edit"
      ? theme.colors.primary
      : $variant === "delete"
        ? theme.colors.danger
        : theme.colors.textSecondary};
  &:hover {
    background-color: ${({ $variant, theme }) =>
      $variant === "edit"
        ? theme.colors.primary
        : $variant === "delete"
          ? theme.colors.danger
          : theme.colors.textPrimary};
    color: ${({ theme }) => theme.colors.textInverse};
  }
`;

/* 6. Sale Modal Form Components */
export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`;
export const FormRow = styled.div<{ $cols?: string }>`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols || "1fr 1fr"};
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  > * {
    min-width: 0;
  }
  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;
export const FormLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .required {
    color: ${({ theme }) => theme.colors.danger};
    margin-left: 2px;
  }
`;
export const FormInput = styled.input`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.15s ease;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.shadows.focusPrimary};
  }
`;
export const FormSelect = styled.select`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
export const FormError = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`;
export const ItemLinesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-sizing: border-box;
  width: 100%;
`;
export const ItemLinesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
export const ItemLinesTitle = styled.h4`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
export const ItemLineHeaderRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) 75px 105px 85px 30px;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 2px;
  > *:nth-child(4) {
    text-align: right;
  }
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;
export const ItemLineRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) 75px 105px 85px 30px;
  gap: 8px;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  > * {
    min-width: 0;
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;
export const ItemLineTotal = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const AddItemBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border: 1px dashed ${({ theme }) => theme.colors.primaryBorderDashed};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
  }
`;
export const RemoveItemBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: none;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.dangerLightAlt};
  color: ${({ theme }) => theme.colors.danger};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.textInverse};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
export const TotalsCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.backgroundMuted};
  border-radius: ${({ theme }) => theme.radius.md};
  box-sizing: border-box;
  width: 100%;
`;
export const TotalsRow = styled.div<{ $isTotal?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ $isTotal }) => ($isTotal ? "14.5px" : "12.5px")};
  font-weight: ${({ $isTotal }) => ($isTotal ? "800" : "500")};
  color: ${({ $isTotal, theme }) => ($isTotal ? theme.colors.textPrimary : theme.colors.textSecondary)};
  border-top: ${({ $isTotal, theme }) => ($isTotal ? `1px dashed ${theme.colors.borderDashed}` : "none")};
  padding-top: ${({ $isTotal }) => ($isTotal ? "6px" : "0")};
`;
export const TotalsAmount = styled.span<{
  $variant?: "primary" | "success" | "danger" | "muted";
}>`
  font-weight: 700;
  color: ${({ $variant, theme }) =>
    $variant === "primary"
      ? theme.colors.primary
      : $variant === "success"
        ? theme.colors.success
        : $variant === "danger"
          ? theme.colors.danger
          : theme.colors.textMuted};
`;
export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 6px;
`;
export const CancelBtn = styled.button`
  padding: 9px 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
  }
`;
export const SubmitBtn = styled.button`
  padding: 9px 20px;
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textInverse};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
