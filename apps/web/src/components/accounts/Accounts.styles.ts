import styled from "styled-components";

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
  TotalsCard,
  TotalsRow,
  TotalsAmount,
  ModalFooter,
  CancelBtn,
  SubmitBtn,
  ViewContainer,
  ViewHeader,
  ViewMetaGrid,
  ViewMetaCard,
  ViewMetaLabel,
  ViewMetaValue,
  PrintBtn,
  ViewDocumentNumber,
  DocumentTitle,
  DocumentDate,
  PrintNotice,
} from "@/components/common/ModalForm.styles";

export const AccountsContainer = styled.div`
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

export const RecordExpenseBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  border: none;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${({ theme }) => theme.shadows.btnPrimary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    justify-content: center;
  }
`;

export const RecordIncomeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 9px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    justify-content: center;
  }
`;

export const InlineCreateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  border: none;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: max-content;
  height: 38px;
  box-sizing: border-box;
  transition: all 0.15s ease;

  span {
    white-space: nowrap;
  }

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
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
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.hoverBorder};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const StatIconBox = styled.div<{
  $colorVariant?: "primary" | "success" | "warning" | "danger" | "info";
}>`
  width: 48px;
  height: 48px;
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
        : $colorVariant === "danger"
          ? theme.colors.dangerLight
          : $colorVariant === "info"
            ? theme.colors.infoLight
            : theme.colors.primaryLight};

  color: ${({ $colorVariant, theme }) =>
    $colorVariant === "success"
      ? theme.colors.success
      : $colorVariant === "warning"
        ? theme.colors.warning
        : $colorVariant === "danger"
          ? theme.colors.danger
          : $colorVariant === "info"
            ? theme.colors.info
            : theme.colors.primary};
`;

export const StatDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

export const StatValue = styled.span`
  font-size: 19px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StatBadge = styled.span<{ $positive?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.success : theme.colors.danger};
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

export const TabNav = styled.div`
  display: flex;
  align-items: stretch;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  scrollbar-width: none;
  position: relative;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TabItem = styled.button<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textSecondary};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.hoverSubtle : "transparent"};
  border: none;
  border-bottom: 2px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary : "transparent"};
  margin-bottom: -1px;
  position: relative;
  z-index: ${({ $isActive }) => ($isActive ? "2" : "1")};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
  border-radius: ${({ theme }) => `${theme.radius.md} ${theme.radius.md} 0 0`};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
  }
`;

export const TabBadge = styled.span<{ $isActive: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primaryLight : theme.colors.backgroundSubtle};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textMuted};
  border: 1px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primaryBorder : theme.colors.border};
`;

export const TabContentPanel = styled.div`
  min-height: 480px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: tabFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes tabFadeIn {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const FilterBarCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 14px 18px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const FilterControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchField = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 8px 14px;
  flex: 1;
  min-width: 260px;
  transition: border-color 0.15s ease;

  ${({ theme }) => theme.media.tablet} {
    min-width: 100%;
    width: 100%;
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
    flex-shrink: 0;
  }
`;

export const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13.5px;
  width: 100%;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const FilterSelectsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
  }

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
`;

export const DateRangeGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
  }
`;

export const DateRangeSeparator = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

export const DateInput = styled.input`
  height: 36px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12.5px;
  font-family: inherit;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }

  ${({ theme }) => theme.media.mobile} {
    flex: 1;
    min-width: 0;
  }
`;

export const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1.2fr;
  gap: 20px;

  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: 1fr;
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
  }

  ${({ theme }) => theme.media.mobile} {
    gap: 14px;
  }
`;

export const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 22px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  position: relative;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  min-height: 40px;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ChartTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.2px;
  margin: 0;
`;

export const DemoBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.full};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
`;

export const ChartSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

export const SummaryStatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    gap: 10px;
    padding: 10px 14px;
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px 14px;
  }
`;

export const SummaryStatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StatNumber = styled.span<{ $variant?: "primary" | "danger" | "success" }>`
  font-size: 15px;
  font-weight: 800;
  color: ${({ $variant, theme }) =>
    $variant === "danger"
      ? theme.colors.danger
      : $variant === "success"
        ? theme.colors.success
        : theme.colors.textPrimary};
`;

export const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

export const LegendDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color};
`;

export const ChartCanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  user-select: none;
`;

export const SvgContainer = styled.svg`
  width: 100%;
  max-width: 100%;
  height: auto;
  display: block;
`;

export const TooltipOverlay = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  top: ${({ $y }) => `${$y}px`};
  left: ${({ $x }) => `${$x}px`};
  transform: translate(-50%, -100%) translateY(-10px);
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 10px 14px;
  z-index: 20;
  pointer-events: none;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TooltipTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 4px;
  margin-bottom: 2px;
`;

export const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11.5px;
`;

export const TooltipLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const TooltipValue = styled.span<{ $color?: string; $isBold?: boolean }>`
  font-weight: ${({ $isBold }) => ($isBold ? "700" : "600")};
  color: ${({ $color, theme }) => $color || theme.colors.textPrimary};
`;

export const PnLCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 22px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const PnLHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 12px;
`;

export const PnLTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.2px;
  margin: 0;
`;

export const PnLSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

export const PnLSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const PnLSectionTitle = styled.h4`
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

export const PnLRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PnLLabel = styled.span<{ $bold?: boolean }>`
  font-weight: ${({ $bold }) => ($bold ? "700" : "500")};
`;

export const PnLValue = styled.span<{ $color?: string; $bold?: boolean }>`
  font-weight: ${({ $bold }) => ($bold ? "700" : "600")};
  color: ${({ $color, theme }) => $color || theme.colors.textPrimary};
`;

export const PnLDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 4px 0;
`;

export const PnLTotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PnLTotalLabel = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PnLTotalValue = styled.span<{ $isPositive?: boolean }>`
  font-size: 17px;
  font-weight: 800;
  color: ${({ $isPositive, theme }) =>
    $isPositive ? theme.colors.success : theme.colors.danger};
`;

export const CategoryProgressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
`;

export const CategoryProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CategoryProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
`;

export const CategoryProgressName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CategoryProgressAmount = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const CategoryProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radius.full};
  overflow: hidden;
`;

export const CategoryProgressFill = styled.div<{ $percentage: number; $color?: string }>`
  width: ${({ $percentage }) => `${Math.min(100, Math.max(0, $percentage))}%`};
  height: 100%;
  background-color: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.full};
  transition: width 0.3s ease;
`;

export const VoucherHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 18px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

export const VoucherPartyCard = styled.div`
  padding: 12px 14px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const VoucherMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const VoucherMetaCard = styled.div`
  padding: 10px 12px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const VoucherMetaLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const VoucherMetaValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const CellStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const CellPrimaryText = styled.span`
  font-weight: 700;
  color: inherit;
`;

export const CellSecondaryText = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const CellCodeText = styled.span`
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const CellDateText = styled.span`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CellAmountText = styled.span<{ $bold?: boolean }>`
  font-weight: ${({ $bold }) => ($bold ? 700 : 600)};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const CellMethodWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const CellTruncateText = styled.span`
  font-size: 12px;
  max-width: 240px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const VoucherCompanyCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const VoucherCompanyTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const VoucherCompanyAddress = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const VoucherDocBadgeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  ${({ theme }) => theme.media.mobile} {
    align-items: flex-start;
  }
`;

export const VoucherDocNumber = styled.span`
  font-size: 12px;
  font-family: monospace;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const VoucherPartyLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const VoucherPartyName = styled.div<{ $larger?: boolean }>`
  font-size: ${({ $larger }) => ($larger ? "15px" : "14px")};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const VoucherPartyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
`;

export const VoucherMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const VoucherPhoneWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const VoucherBadgeWrap = styled.span`
  margin-left: 8px;
`;

export const VoucherSubtitleText = styled.span`
  font-size: 12px;
  opacity: 0.8;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const TotalsValueText = styled.span<{ $bold?: boolean }>`
  font-weight: ${({ $bold }) => ($bold ? 700 : 600)};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TotalsDescText = styled.span`
  font-size: 12px;
  max-width: 60%;
  color: ${({ theme }) => theme.colors.textSecondary};

  ${({ theme }) => theme.media.mobile} {
    max-width: 100%;
  }
`;

export const ChartBarGroup = styled.g`
  cursor: pointer;
`;

export const PnLMarginSubtext = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const PnLBreakdownSection = styled(PnLSection)`
  margin-top: 18px;
`;
