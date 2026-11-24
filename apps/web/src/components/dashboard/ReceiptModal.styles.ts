import styled from "styled-components";

export {
  ViewContainer as ReceiptContainer,
  PrintNotice,
} from "@/components/common/ModalForm.styles";

export const ReceiptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 18px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const StoreInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StoreName = styled.h4`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const StoreAddress = styled.p`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

export const ReceiptBadgeGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;

  ${({ theme }) => theme.media.mobile} {
    align-items: flex-start;
  }
`;

export const InvoiceTag = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
  display: inline-block;
  letter-spacing: 0.3px;
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const DetailCard = styled.div`
  padding: 12px 14px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DetailLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ItemsSection = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
`;

export const ItemsHeader = styled.div`
  padding: 10px 14px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ItemsList = styled.div`
  padding: 12px 14px;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.4;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
    margin-top: 3px;
  }
`;

export const TotalsBox = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.backgroundSubtle},
    ${({ theme }) => theme.colors.background}
  );
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TotalRow = styled.div<{ $isFinal?: boolean; $isDue?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ $isFinal }) => ($isFinal ? "15px" : "13px")};
  font-weight: ${({ $isFinal, $isDue }) => ($isFinal || $isDue ? 800 : 500)};
  color: ${({ $isFinal, $isDue, theme }) =>
    $isDue
      ? theme.colors.danger
      : $isFinal
        ? theme.colors.primary
        : theme.colors.textSecondary};
  padding-top: ${({ $isFinal }) => ($isFinal ? "8px" : "0")};
  border-top: ${({ $isFinal, theme }) =>
    $isFinal ? `1px dashed ${theme.colors.borderDashed}` : "none"};
`;
