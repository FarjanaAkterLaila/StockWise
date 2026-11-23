import React from "react";
import type { LowStockProduct } from "@/types";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";
import { AlertTriangle, ArrowRight, PackagePlus, Boxes } from "lucide-react";
import {
  LowStockTitleWrap,
  LowStockList,
  LowStockItem,
  ItemTopRow,
  ProductInfo,
  ProductNameRow,
  ProductName,
  ProductMetaRow,
  SkuText,
  MetaDot,
  CategoryText,
  ActionColumn,
  ReorderButton,
  BarContainer,
  BarLabels,
  StockCount,
  MinStockCount,
  ProgressTrack,
  ProgressFill,
  LowStockFooter,
  FooterInfo,
  BulkOrderButton,
  HeaderLink,
} from "./LowStockAlert.styles";

interface LowStockAlertProps {
  products: LowStockProduct[];
  onViewInventory?: () => void;
  onRestockProduct?: (product: LowStockProduct) => void;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  products,
  onViewInventory,
  onRestockProduct,
}) => {
  return (
    <Card
      title={
        <LowStockTitleWrap>
          <AlertTriangle size={18} />
          <span>Low-Stock Alerts</span>
        </LowStockTitleWrap>
      }
      subtitle="Critical inventory thresholds requiring purchase reorders"
      action={
        <HeaderLink onClick={onViewInventory} type="button">
          <span>Catalog</span>
          <ArrowRight size={14} />
        </HeaderLink>
      }
    >
      <LowStockList>
        {products.map((item) => {
          const percentage = Math.min(
            100,
            Math.round((item.currentStock / item.minStock) * 100),
          );
          const isCritical = item.currentStock <= 2;

          return (
            <LowStockItem key={item.id}>
              <ItemTopRow>
                <ProductInfo>
                  <ProductNameRow>
                    <ProductName>{item.name}</ProductName>
                    <Badge
                      variant={
                        isCritical
                          ? BADGE_VARIANTS.DANGER
                          : BADGE_VARIANTS.WARNING
                      }
                      size={UI_SIZES.SM}
                      dot
                    >
                      {isCritical ? "Critical" : "Low Stock"}
                    </Badge>
                  </ProductNameRow>
                  <ProductMetaRow>
                    <SkuText>{item.sku}</SkuText>
                    <MetaDot>•</MetaDot>
                    <CategoryText>{item.category}</CategoryText>
                  </ProductMetaRow>
                </ProductInfo>

                <ActionColumn>
                  <ReorderButton
                    onClick={() => onRestockProduct?.(item)}
                    type="button"
                    title={`Create PO for ${item.name}`}
                  >
                    <PackagePlus size={14} />
                    <span>Reorder</span>
                  </ReorderButton>
                </ActionColumn>
              </ItemTopRow>

              <BarContainer>
                <BarLabels>
                  <StockCount>
                    On Hand:{" "}
                    <strong>
                      {item.currentStock} {item.unit}
                    </strong>
                  </StockCount>
                  <MinStockCount>
                    Min Threshold: {item.minStock} {item.unit}
                  </MinStockCount>
                </BarLabels>
                <ProgressTrack>
                  <ProgressFill
                    $percentage={percentage}
                    $isCritical={isCritical}
                  />
                </ProgressTrack>
              </BarContainer>
            </LowStockItem>
          );
        })}
      </LowStockList>

      <LowStockFooter>
        <FooterInfo>
          <Boxes size={16} />
          <span>5 items out of 142 SKUs require distributor intake</span>
        </FooterInfo>
        <BulkOrderButton onClick={onViewInventory} type="button">
          Create Bulk Restock PO
        </BulkOrderButton>
      </LowStockFooter>
    </Card>
  );
};
