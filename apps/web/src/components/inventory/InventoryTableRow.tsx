import React from 'react';
import type { Product } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Pencil, Trash2, XCircle } from 'lucide-react';
import { formatCurrency, calculateMargin, calculateStockPercentage } from '@/utils/formatters';
import {
  TableRow,
  TableCell,
  ProductInfoCell,
  ProductName,
  CategoryTag,
  CodeBlock,
  SkuCode,
  BarcodeSub,
  PriceBlock,
  MainPrice,
  SubPrice,
  MarginBadge,
  StockProgressWrap,
  StockCountRow,
  QuantityText,
  MinThreshold,
  ProgressBarTrack,
  ProgressBarFill,
  ActionButtonsGroup,
  ActionBtn,
} from './Inventory.styles';

interface InventoryTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const InventoryTableRow: React.FC<InventoryTableRowProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity <= product.minStockLevel && !isOutOfStock;
  const percentage = calculateStockPercentage(product.stockQuantity, product.minStockLevel);
  const marginPercent = calculateMargin(product.sellingPrice, product.costPrice);

  return (
    <TableRow>
      <TableCell>
        <ProductInfoCell>
          <ProductName>{product.name}</ProductName>
          <CategoryTag>{product.category}</CategoryTag>
        </ProductInfoCell>
      </TableCell>

      <TableCell>
        <CodeBlock>
          <SkuCode>{product.sku}</SkuCode>
          {product.barcode && <BarcodeSub>{product.barcode}</BarcodeSub>}
        </CodeBlock>
      </TableCell>

      <TableCell>
        <PriceBlock>
          <MainPrice>{formatCurrency(product.costPrice)}</MainPrice>
          <SubPrice>per {product.unit}</SubPrice>
        </PriceBlock>
      </TableCell>

      <TableCell>
        <PriceBlock>
          <MainPrice>{formatCurrency(product.sellingPrice)}</MainPrice>
          <MarginBadge>+{marginPercent}% margin</MarginBadge>
        </PriceBlock>
      </TableCell>

      <TableCell>
        <StockProgressWrap>
          <StockCountRow>
            <QuantityText $isLow={isLowStock || isOutOfStock}>
              {product.stockQuantity} {product.unit}
            </QuantityText>
            <MinThreshold>Min: {product.minStockLevel}</MinThreshold>
          </StockCountRow>
          <ProgressBarTrack>
            <ProgressBarFill $percentage={percentage} $isLow={isLowStock || isOutOfStock} />
          </ProgressBarTrack>
        </StockProgressWrap>
      </TableCell>

      <TableCell>
        {isOutOfStock ? (
          <Badge variant="danger" size="sm" dot>
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge variant="warning" size="sm" dot>
            Low Stock
          </Badge>
        ) : (
          <Badge variant="success" size="sm" dot>
            In Stock
          </Badge>
        )}
      </TableCell>

      <TableCell>
        {product.status === 'active' ? (
          <Badge variant="neutral" size="sm">
            Active
          </Badge>
        ) : (
          <Badge variant="danger" size="sm">
            <XCircle size={10} style={{ display: 'inline', marginRight: '3px' }} />
            Inactive
          </Badge>
        )}
      </TableCell>

      <TableCell $align="right">
        <ActionButtonsGroup>
          <ActionBtn
            $variant="edit"
            onClick={() => onEdit(product)}
            title={`Edit ${product.name}`}
            type="button"
          >
            <Pencil size={15} />
          </ActionBtn>
          <ActionBtn
            $variant="delete"
            onClick={() => onDelete(product)}
            title={`Delete ${product.name}`}
            type="button"
          >
            <Trash2 size={15} />
          </ActionBtn>
        </ActionButtonsGroup>
      </TableCell>
    </TableRow>
  );
};
