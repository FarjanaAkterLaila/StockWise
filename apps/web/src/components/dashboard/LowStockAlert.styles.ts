import styled from 'styled-components';

export const LowStockTitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

export const LowStockList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const LowStockItem = styled.div`
  padding: 12px 14px;
  background-color: #f8fafc;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: all 0.2s ease;

  &:hover {
    background-color: #ffffff;
    border-color: #cbd5e1;
  }
`;

export const ItemTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProductNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ProductName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
`;

export const ProductMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

export const SkuText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const MetaDot = styled.span`
  color: #cbd5e1;
  font-size: 10px;
`;

export const CategoryText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ActionColumn = styled.div`
  display: flex;
  align-items: center;
`;

export const ReorderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 600;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }
`;

export const BarContainer = styled.div`
  margin-top: 10px;
`;

export const BarLabels = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 4px;
`;

export const StockCount = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};

  strong {
    font-weight: 700;
  }
`;

export const MinStockCount = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ProgressTrack = styled.div`
  height: 6px;
  background-color: #e2e8f0;
  border-radius: ${({ theme }) => theme.radius.full};
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percentage: number; $isCritical: boolean }>`
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.full};
  width: ${({ $percentage }) => Math.max(12, $percentage)}%;
  background-color: ${({ $isCritical, theme }) =>
    $isCritical ? theme.colors.danger : theme.colors.warning};
  transition: width 0.3s ease;
`;

export const LowStockFooter = styled.div`
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderCard};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const BulkOrderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const HeaderLink = styled.button`
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
