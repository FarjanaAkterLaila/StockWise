import styled from "styled-components";
import { CHEVRON_DOWN_SVG_MUTED, CHEVRON_DOWN_SVG_PRIMARY } from "@/icons";

export const ModalFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;

export const ModalForm = ModalFormContainer;

export const FormRow = styled.div<{ $cols?: string }>`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols || "1fr 1fr"};
  gap: 14px;
  width: 100%;
  box-sizing: border-box;

  > * {
    min-width: 0;
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const FormLabel = styled.label`
  font-size: 12.5px;
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
  height: 38px;
  min-height: 38px;
  padding: 0 14px;
  font-size: 13.5px;
  font-family: inherit;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &[type="date"] {
    padding: 0 10px;
    line-height: 36px;
  }

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
    box-shadow: ${({ theme }) => theme.shadows.focusPrimary};
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: 38px;
  min-height: 38px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 0 36px 0 14px;
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
  line-height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  background-image: url("${CHEVRON_DOWN_SVG_MUTED}");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    border-color: ${({ theme }) => theme.colors.hoverBorder};
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.background};
    background-image: url("${CHEVRON_DOWN_SVG_PRIMARY}");
    box-shadow: ${({ theme }) => theme.shadows.focusPrimary};
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  min-height: 60px;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: all 0.15s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focusPrimary};
  }
`;

export const FormError = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
`;

export const ItemLinesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 14px;
`;

export const ItemLinesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ItemLinesTitle = styled.span`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const AddItemBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryBorder};
  }
`;

export const ItemLineHeaderRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 85px 125px 130px 36px;
  gap: 10px;
  padding: 0 4px 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};

  > * {
    min-width: 0;
  }

  > span:nth-child(4) {
    text-align: right;
  }

  ${({ theme }) => theme.media.tabletSm} {
    display: none;
  }

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

export const ItemLineRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 85px 125px 130px 36px;
  gap: 10px;
  align-items: center;

  > * {
    min-width: 0;
  }

  ${({ theme }) => theme.media.tabletSm} {
    grid-template-columns: 1fr;
    background-color: ${({ theme }) => theme.colors.background};
    padding: 10px;
    border-radius: ${({ theme }) => theme.radius.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    background-color: ${({ theme }) => theme.colors.background};
    padding: 10px;
    border-radius: ${({ theme }) => theme.radius.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export const ItemLineTotal = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RemoveItemBtn = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.danger};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerLight};
    border-color: ${({ theme }) => theme.colors.dangerBorder};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const TotalsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TotalsRow = styled.div<{
  $isGrandTotal?: boolean;
  $isTotal?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ $isGrandTotal, $isTotal }) =>
    $isGrandTotal || $isTotal ? "15px" : "12.5px"};
  font-weight: ${({ $isGrandTotal, $isTotal }) =>
    $isGrandTotal || $isTotal ? "800" : "500"};
  color: ${({ $isGrandTotal, $isTotal, theme }) =>
    $isGrandTotal || $isTotal
      ? theme.colors.textPrimary
      : theme.colors.textSecondary};
  padding-top: ${({ $isGrandTotal, $isTotal }) =>
    $isGrandTotal || $isTotal ? "8px" : "0"};
  border-top: ${({ $isGrandTotal, $isTotal, theme }) =>
    $isGrandTotal || $isTotal ? `1px solid ${theme.colors.border}` : "none"};
`;

export const TotalsAmount = styled.span<{
  $highlight?: boolean;
  $danger?: boolean;
  $variant?: "primary" | "success" | "danger" | "muted";
}>`
  font-weight: 700;
  color: ${({ $danger, $highlight, $variant, theme }) =>
    $danger || $variant === "danger"
      ? theme.colors.danger
      : $highlight || $variant === "primary"
        ? theme.colors.primary
        : $variant === "success"
          ? theme.colors.success
          : $variant === "muted"
            ? theme.colors.textMuted
            : "inherit"};
`;

export const VatAmountText = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column-reverse;
    align-items: stretch;
    width: 100%;

    > * {
      width: 100%;
      justify-content: center;
    }
  }

  @media print {
    display: none;
  }
`;

export const CancelBtn = styled.button`
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const SubmitBtn = styled.button`
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textInverse};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: ${({ theme }) => theme.shadows.btnPrimary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media print {
    gap: 12px;
    padding: 20px 24px;
    border: 1px solid ${({ theme }) => theme.colors.borderDashed};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    box-shadow: none;
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
    box-sizing: border-box;
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;

export const ViewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

export const ViewMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const ViewMetaCard = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const ViewMetaLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ViewMetaValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ViewItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;

  th {
    padding: 8px 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }

  td {
    padding: 10px;
    font-size: 12.5px;
    color: ${({ theme }) => theme.colors.textPrimary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  }
`;

export const PrintBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textInverse};
  background-color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
  }

  @media print {
    display: none;
  }
`;

export const ViewDocumentNumber = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const DocumentTitle = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

export const DocumentDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const PrintNotice = styled.div`
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
  padding-top: 4px;
`;
