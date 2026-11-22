import React from 'react';
import type { MetricSummary } from '@/types';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import {
  CardWrap,
  CardHeaderRow,
  MetricTitle,
  IconBox,
  ValueRow,
  MetricValue,
  StatusPill,
  FooterRow,
  TrendBadge,
  PeriodLabel,
} from './MetricCard.styles';

interface MetricCardProps {
  metric: MetricSummary;
}

const ICON_MAP = {
  'dollar-sign': DollarSign,
  'shopping-cart': ShoppingCart,
  'package': Package,
  'alert-triangle': AlertTriangle,
  'trending-up': TrendingUp,
};

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const Icon = ICON_MAP[metric.iconName] || TrendingUp;

  return (
    <CardWrap $metricId={metric.id}>
      <CardHeaderRow>
        <MetricTitle>{metric.title}</MetricTitle>
        <IconBox $metricId={metric.id}>
          <Icon size={18} />
        </IconBox>
      </CardHeaderRow>

      <ValueRow>
        <MetricValue>{metric.value}</MetricValue>
        {metric.badgeText && (
          <StatusPill $isPositive={metric.isPositive}>
            {metric.badgeText}
          </StatusPill>
        )}
      </ValueRow>

      <FooterRow>
        <TrendBadge $isPositive={metric.isPositive}>
          {metric.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {metric.change}
        </TrendBadge>
        <PeriodLabel>{metric.period}</PeriodLabel>
      </FooterRow>
    </CardWrap>
  );
};
