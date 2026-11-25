import React from "react";
import type { Product } from "@/types";
import { Badge } from "@/components/common/Badge";
import { PRODUCT_STATUS, BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";
import { Archive, Pencil, RotateCcw, XCircle } from "lucide-react";
import {
  formatCurrency,
  calculateMargin,
  calculateStockPercentage,
} from "@/utils/formatters";
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
} from "./Inventory.styles";

interface InventoryTableRowProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onArchive?: (product: Product) => void;
  onRestore?: (product: Product) => void;
}

export const InventoryTableRow: React.FC<InventoryTableRowProps> = ({
  product,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const currentStock = Math.max(0, Number(product.stockQuantity) || 0);
  const reorderLevel = Math.max(0, Number(product.minStockLevel) || 0);
  const isOutOfStock = currentStock === 0;
  const isLowStock = !isOutOfStock && currentStock <= reorderLevel;
  const stockHealth = isOutOfStock ? "out" : isLowStock ? "low" : "healthy";
  const percentage = calculateStockPercentage(currentStock, reorderLevel);
  const marginPercent = calculateMargin(
    product.sellingPrice,
    product.costPrice,
  );

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
            <QuantityText $stockHealth={stockHealth}>
              {currentStock} {product.unit}
            </QuantityText>
            <MinThreshold>Min: {reorderLevel}</MinThreshold>
          </StockCountRow>
          <ProgressBarTrack $stockHealth={stockHealth}>
            <ProgressBarFill
              $percentage={percentage}
              $stockHealth={stockHealth}
            />
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
        {product.status === PRODUCT_STATUS.ACTIVE ? (
          <Badge variant={BADGE_VARIANTS.NEUTRAL} size={UI_SIZES.SM}>
            Active
          </Badge>
        ) : product.status === PRODUCT_STATUS.ARCHIVED ? (
          <Badge variant={BADGE_VARIANTS.WARNING} size={UI_SIZES.SM}>
            <Archive
              size={10}
              style={{ display: "inline", marginRight: "3px" }}
            />
            Archived
          </Badge>
        ) : (
          <Badge variant={BADGE_VARIANTS.DANGER} size={UI_SIZES.SM}>
            <XCircle
              size={10}
              style={{ display: "inline", marginRight: "3px" }}
            />
            Inactive
          </Badge>
        )}
      </TableCell>

      <TableCell $align="right">
        <ActionButtonsGroup>
          {onEdit && (
            <ActionBtn
              $variant="edit"
              onClick={() => onEdit(product)}
              title={`Edit ${product.name}`}
              type="button"
            >
              <Pencil size={15} />
            </ActionBtn>
          )}
          {product.status === PRODUCT_STATUS.ARCHIVED
            ? onRestore && (
                <ActionBtn
                  $variant="view"
                  onClick={() => onRestore(product)}
                  title={`Restore ${product.name}`}
                  type="button"
                >
                  <RotateCcw size={15} />
                </ActionBtn>
              )
            : onArchive && (
                <ActionBtn
                  $variant="view"
                  onClick={() => onArchive(product)}
                  title={`Archive ${product.name}`}
                  type="button"
                >
                  <Archive size={15} />
                </ActionBtn>
              )}
        </ActionButtonsGroup>
      </TableCell>
    </TableRow>
  );
};
