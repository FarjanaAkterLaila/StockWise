import styled from "styled-components";
import { CHEVRON_DOWN_SVG_MUTED, CHEVRON_DOWN_SVG_PRIMARY } from "@/icons";

export const InventoryContainer = styled.div`
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

export const AddProductBtn = styled.button`
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

export const TableFooterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  box-sizing: border-box;
`;

export const FooterCountText = styled.span`
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
  max-width: 420px;
  line-height: 1.5;
`;

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

export const ProductInfoCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProductName = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const CodeBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SkuCode = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const BarcodeSub = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const PriceBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const MainPrice = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SubPrice = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const MarginBadge = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
`;

export const StockProgressWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 110px;
`;

export const StockCountRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
`;

export const QuantityText = styled.span<{ $isLow?: boolean }>`
  font-weight: 700;
  color: ${({ $isLow, theme }) =>
    $isLow ? theme.colors.danger : theme.colors.textPrimary};
`;

export const MinThreshold = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 10.5px;
`;

export const ProgressBarTrack = styled.div`
  height: 5px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  overflow: hidden;
`;

export const ProgressBarFill = styled.div<{
  $percentage: number;
  $isLow?: boolean;
}>`
  height: 100%;
  width: ${({ $percentage }) => Math.min(Math.max($percentage, 5), 100)}%;
  background-color: ${({ $isLow, theme }) =>
    $isLow ? theme.colors.danger : theme.colors.success};
  border-radius: 999px;
`;

export const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

export const ActionBtn = styled.button<{ $variant: "edit" | "delete" }>`
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
    $variant === "edit" ? theme.colors.primaryLight : theme.colors.dangerLight};
  color: ${({ $variant, theme }) =>
    $variant === "edit" ? theme.colors.primary : theme.colors.danger};
  &:hover {
    background-color: ${({ $variant, theme }) =>
      $variant === "edit" ? theme.colors.primary : theme.colors.danger};
    color: ${({ theme }) => theme.colors.textInverse};
  }
`;

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
  gap: 6px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
  > * {
    min-width: 0;
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const FormLabel = styled.label`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  .required {
    color: ${({ theme }) => theme.colors.danger};
    margin-left: 2px;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 14px;
  font-size: 13.5px;
  font-family: inherit;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.hoverBorder};
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.background};
    box-shadow:
      0 0 0 3px ${({ theme }) => theme.colors.primaryFocusRing},
      0 1px 2px rgba(15, 23, 42, 0.05);
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 10px 36px 10px 14px;
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.4;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background};
  background-image: url("${CHEVRON_DOWN_SVG_MUTED}");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

  &:hover {
    border-color: ${({ theme }) => theme.colors.hoverBorder};
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
    background-image: url("${CHEVRON_DOWN_SVG_PRIMARY}");
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.background};
    box-shadow:
      0 0 0 3px ${({ theme }) => theme.colors.primaryFocusRing},
      0 1px 2px rgba(15, 23, 42, 0.05);
    background-image: url("${CHEVRON_DOWN_SVG_PRIMARY}");
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 13.5px;
    padding: 10px 14px;
  }
`;

export const FormError = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`;

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

export const CancelButton = styled.button`
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

export const SubmitButton = styled.button`
  padding: 9px 18px;
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
