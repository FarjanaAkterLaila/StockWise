import React, { useState, useMemo } from "react";
import type { InventoryStatusBreakdown } from "@/types";
import { DonutChartIcon } from "@/components/icons";
import {
  ChartCard,
  ChartHeader,
  TitleBlock,
  TitleRow,
  ChartTitle,
  ChartSubtitle,
  DonutLayout,
  DonutVisualWrap,
  DonutCenterText,
  CenterCount,
  CenterLabel,
  LegendList,
  LegendCard,
  LegendLeft,
  ColorPill,
  CategoryName,
  LegendRight,
  ItemCount,
  ItemPercentage,
} from "./InventoryStatusDonutChart.styles";

interface InventoryStatusDonutChartProps {
  data?: InventoryStatusBreakdown[];
}

const calculateDonutSegments = (
  items: InventoryStatusBreakdown[],
  circumference: number,
) => {
  let accumulatedOffset = 0;
  return items.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (item.percentage / 100) * circumference;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });
};

export const InventoryStatusDonutChart: React.FC<
  InventoryStatusDonutChartProps
> = ({ data = [] }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const totalCount = data.reduce((acc, item) => acc + item.count, 0);

  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2; // (180 - 24) / 2 = 78
  const circumference = 2 * Math.PI * radius; // ~490.08

  // Compute stroke offsets for each category
  const segments = useMemo(
    () => calculateDonutSegments(data, circumference),
    [data, circumference],
  );

  const activeItem = activeCategory
    ? data.find((d) => d.category === activeCategory)
    : null;

  return (
    <ChartCard>
      <ChartHeader>
        <TitleBlock>
          <TitleRow>
            <ChartTitle>Inventory Status</ChartTitle>
          </TitleRow>
          <ChartSubtitle>
            Hardware catalog distribution across stock health categories
          </ChartSubtitle>
        </TitleBlock>
      </ChartHeader>

      <DonutLayout>
        <DonutVisualWrap>
          <DonutChartIcon
            size={size}
            radius={radius}
            strokeWidth={strokeWidth}
            segments={segments}
            activeCategory={activeCategory}
            onHoverSegment={setActiveCategory}
          />

          <DonutCenterText>
            <CenterCount>
              {activeItem ? activeItem.count : totalCount}
            </CenterCount>
            <CenterLabel>
              {activeItem ? activeItem.label : "Total SKUs"}
            </CenterLabel>
          </DonutCenterText>
        </DonutVisualWrap>

        <LegendList>
          {data.map((item) => {
            const isHovered = activeCategory === item.category;

            return (
              <LegendCard
                key={item.category}
                $isActive={isHovered}
                $color={item.color}
                onMouseEnter={() => setActiveCategory(item.category)}
                onMouseLeave={() => setActiveCategory(null)}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === item.category ? null : item.category,
                  )
                }
              >
                <LegendLeft>
                  <ColorPill $color={item.color} />
                  <CategoryName>{item.label}</CategoryName>
                </LegendLeft>

                <LegendRight>
                  <ItemCount>{item.count} items</ItemCount>
                  <ItemPercentage $color={item.color}>
                    ({item.percentage.toFixed(1)}%)
                  </ItemPercentage>
                </LegendRight>
              </LegendCard>
            );
          })}
        </LegendList>
      </DonutLayout>
    </ChartCard>
  );
};
