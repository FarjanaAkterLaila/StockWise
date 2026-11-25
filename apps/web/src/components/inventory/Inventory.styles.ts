import styled from "styled-components";
import { CHEVRON_DOWN_SVG_MUTED } from "@/icons";

export {
  TableContainer,
  TableResponsiveWrapper,
  Table,
  TableHead,
  HeaderRow,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableFooterBar,
  FooterCountText,
  ActiveFilterBadge,
  EmptyState,
  EmptyIconWrap,
  EmptyTitle,
  EmptyDesc,
  ClearFilterBtn,
  ActionButtonsGroup,
  ActionBtn,
} from "@/components/common/Table.styles";

export {
  ModalForm,
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormError,
  ModalFooter,
  CancelBtn as CancelButton,
  SubmitBtn as SubmitButton,
} from "@/components/common/ModalForm.styles";

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
    align-items: stretch;
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

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
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

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    justify-content: center;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.media.tablet} {
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
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const FilterControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchField = styled.div`
  position: relative;
  flex: 1;
  min-width: 240px;
  max-width: 360px;

  ${({ theme }) => theme.media.tablet} {
    max-width: 100%;
    min-width: 100%;
  }

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textMuted};
    pointer-events: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 9px 12px 9px 36px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
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

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    display: block;
    select {
      width: 100%;
    }
  }

  &::after {
    content: "";
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background-image: url("${CHEVRON_DOWN_SVG_MUTED}");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    pointer-events: none;
  }
`;

export const SelectIconWrap = styled.div`
  position: absolute;
  left: 11px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.textMuted};
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

export const ResultsCountRow = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  padding-top: 10px;
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

export type StockHealth = "healthy" | "low" | "out";

export const QuantityText = styled.span<{ $stockHealth?: StockHealth }>`
  font-weight: 700;
  color: ${({ $stockHealth, theme }) =>
    $stockHealth === "out"
      ? theme.colors.danger
      : $stockHealth === "low"
        ? theme.colors.warning
        : theme.colors.textPrimary};
`;

export const MinThreshold = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 10.5px;
`;

export const ProgressBarTrack = styled.div<{ $stockHealth?: StockHealth }>`
  height: 5px;
  width: 100%;
  background-color: ${({ $stockHealth, theme }) =>
    $stockHealth === "out" ? theme.colors.dangerLightAlt : theme.colors.border};
  box-shadow: ${({ $stockHealth, theme }) =>
    $stockHealth === "out"
      ? `inset 0 0 0 1px ${theme.colors.dangerBorder}`
      : "none"};
  border-radius: 999px;
  overflow: hidden;
`;

export const ProgressBarFill = styled.div<{
  $percentage: number;
  $stockHealth?: StockHealth;
}>`
  height: 100%;
  width: ${({ $percentage }) =>
    $percentage <= 0 ? 0 : Math.min(Math.max($percentage, 5), 100)}%;
  background-color: ${({ $stockHealth, theme }) =>
    $stockHealth === "out"
      ? theme.colors.danger
      : $stockHealth === "low"
        ? theme.colors.warning
        : theme.colors.success};
  border-radius: 999px;
  transition: width 0.25s ease, background-color 0.25s ease;
`;
