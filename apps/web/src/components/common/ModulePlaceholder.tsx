import React from 'react';
import type { NavModule } from '../../types';
import { Badge } from './Badge';
import { 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  WalletCards, 
  ArrowRight,
  Database,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  PlaceholderContainer,
  PlaceholderHero,
  PlaceholderIconWrap,
  HeaderRow,
  PlaceholderTitle,
  PlaceholderSubtitle,
  PlaceholderDesc,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  ContentCard,
  SectionTitle,
  FeaturesList,
  FeatureItem,
  FeatureCheck,
  ActionsRow,
  Button
} from './ModulePlaceholder.styles';

interface ModulePlaceholderProps {
  module: NavModule;
  onNavigateHome: () => void;
}

const MODULE_META: Record<NavModule, { 
  title: string; 
  subtitle: string; 
  description: string; 
  icon: React.ElementType; 
  features: string[];
  stats: { label: string; value: string }[];
}> = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'System Health & Metrics',
    description: 'Main operational overview.',
    icon: Package,
    features: [],
    stats: [],
  },
  sales: {
    title: 'Sales & POS Terminal',
    subtitle: 'Manage Customer Invoices, Quotes & POS Register',
    description: 'Process retail walk-in and wholesale hardware sales, issue computer parts quotes, manage invoice printouts, and record customer payments.',
    icon: ShoppingCart,
    features: [
      'Instant POS Barcode Scanning & Item Lookup',
      'Custom Computer Build Configurator & Quotations',
      'Split Payments (Cash, Card, Mobile Financial Services)',
      'Customer Ledger & Receivables Management'
    ],
    stats: [
      { label: "Today's Invoices", value: '19' },
      { label: 'Unpaid Receivables', value: '$1,620.00' },
      { label: 'Average Ticket Size', value: '$465.00' }
    ]
  },
  purchase: {
    title: 'Purchases & Vendor Bills',
    subtitle: 'Supplier Purchase Orders & Intake Restocking',
    description: 'Track incoming stock shipments from distributors (ASUS, MSI, Gigabyte, Dell, HP), record purchase invoices, and monitor accounts payable.',
    icon: ShoppingBag,
    features: [
      'Purchase Order Generation with Auto-Suggested Quantities',
      'Batch Serial Number Intake for GPUs, Laptops & Processors',
      'Supplier Invoice Matching & Payment Status',
      'Vendor Return & Defective RMA Tracking'
    ],
    stats: [
      { label: 'Active Suppliers', value: '12 Vendors' },
      { label: 'Pending Shipments', value: '3 Inbound' },
      { label: 'Payables Due', value: '$6,420.00' }
    ]
  },
  inventory: {
    title: 'Inventory & Catalog Management',
    subtitle: 'SKU Tracking, Stock Movements & Barcodes',
    description: 'Manage computer parts stock levels, cost and selling margins, minimum threshold alarms, categories, and item warranty durations.',
    icon: Package,
    features: [
      'Multi-category Computer Hardware Catalog',
      'Real-time Stock Adjustment with Audit Trails',
      'Barcode & Serial Number Label Printing',
      'Automated Low-Stock Email & Dashboard Alerts'
    ],
    stats: [
      { label: 'Total Active SKUs', value: '142' },
      { label: 'Low Stock Items', value: '5 Critical' },
      { label: 'Total Catalog Value', value: '$94,200' }
    ]
  },
  accounts: {
    title: 'Accounts & Expense Ledger',
    subtitle: 'Cash Flow, Daily Expenses & Profit/Loss',
    description: 'Monitor daily computer shop operating expenses (rent, technician salaries, utility bills, packaging), cash register balances, and financial health.',
    icon: WalletCards,
    features: [
      'Operating Expense Categorization & Receipt Attachments',
      'Daily Drawer Cash In / Cash Out Reconciliation',
      'Gross Profit & Net Margin Summary Reports',
      'Vendor and Customer Balance Ledger Statements'
    ],
    stats: [
      { label: "This Month's Expenses", value: '$4,120.00' },
      { label: 'Net Profit Margin', value: '23.4%' },
      { label: 'Drawer Cash Balance', value: '$1,840.00' }
    ]
  }
};

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ module, onNavigateHome }) => {
  const meta = MODULE_META[module];
  const Icon = meta.icon;

  return (
    <PlaceholderContainer>
      <PlaceholderHero>
        <PlaceholderIconWrap>
          <Icon />
        </PlaceholderIconWrap>
        <div>
          <HeaderRow>
            <PlaceholderTitle>{meta.title}</PlaceholderTitle>
            <Badge variant="primary" dot>Module Ready for API Binding</Badge>
          </HeaderRow>
          <PlaceholderSubtitle>{meta.subtitle}</PlaceholderSubtitle>
        </div>
      </PlaceholderHero>

      <PlaceholderDesc>{meta.description}</PlaceholderDesc>

      <StatsGrid>
        {meta.stats.map((stat, i) => (
          <StatCard key={i}>
            <StatLabel>{stat.label}</StatLabel>
            <StatValue>{stat.value}</StatValue>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentCard>
        <SectionTitle>
          <Database />
          Planned Capabilities for this Module
        </SectionTitle>
        <FeaturesList>
          {meta.features.map((feature, idx) => (
            <FeatureItem key={idx}>
              <FeatureCheck>✓</FeatureCheck>
              <span>{feature}</span>
            </FeatureItem>
          ))}
        </FeaturesList>

        <ActionsRow>
          <Button $variant="primary" onClick={onNavigateHome}>
            <ArrowRight size={16} />
            Back to Dashboard
          </Button>
          <Button $variant="secondary" disabled title="Will connect when backend routes are activated">
            <PlusCircle size={16} />
            Quick Action (Coming Soon)
          </Button>
          <Button $variant="ghost" disabled title="Report generation">
            <FileSpreadsheet size={16} />
            Export Sample Report
          </Button>
        </ActionsRow>
      </ContentCard>
    </PlaceholderContainer>
  );
};
