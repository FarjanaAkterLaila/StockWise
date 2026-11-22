import React, { useState } from 'react';
import type { RecentSale, PaymentStatus } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import {
  ArrowUpRight,
  Search,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  Eye,
  Filter
} from 'lucide-react';
import {
  ControlsRow,
  SearchBox,
  TableSearchInput,
  FilterBox,
  FilterSelect,
  TableWrapper,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  InvoiceBlock,
  InvoiceNumber,
  CustomerTypeBadge,
  CustomerName,
  ItemsSummaryWrap,
  ItemsText,
  ItemsCount,
  AmountBlock,
  TotalAmount,
  PaidAmount,
  StatusWrapper,
  PaymentMethodRow,
  DateBlock,
  TimeText,
  ActionIconButton,
  EmptyMessage,
  HeaderLinkButton,
} from './RecentSalesTable.styles';

interface RecentSalesTableProps {
  sales: RecentSale[];
  onViewAll?: () => void;
}

const STATUS_VARIANT: Record<PaymentStatus, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

const PAYMENT_ICON = {
  Cash: Banknote,
  Card: CreditCard,
  'Bank Transfer': Building2,
  MFS: Smartphone,
};

export const RecentSalesTable: React.FC<RecentSalesTableProps> = ({
  sales,
  onViewAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sale.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Card
      title="Recent Sales & Invoices"
      subtitle="Latest customer transactions, hardware orders, and payment statuses"
      action={
        <HeaderLinkButton onClick={onViewAll} type="button">
          <span>View All Sales</span>
          <ArrowUpRight size={14} />
        </HeaderLinkButton>
      }
    >
      <ControlsRow>
        <SearchBox>
          <Search size={14} />
          <TableSearchInput
            type="text"
            placeholder="Filter by customer, invoice or hardware item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterBox>
          <Filter size={14} />
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </FilterSelect>
        </FilterBox>
      </ControlsRow>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <TableHeader>Invoice #</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Hardware Items</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Payment</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader $align="right">Action</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <EmptyMessage colSpan={7}>
                  No sales found matching your filter criteria.
                </EmptyMessage>
              </tr>
            ) : (
              filteredSales.map((sale) => {
                const PayIcon = PAYMENT_ICON[sale.paymentMethod] || CreditCard;
                return (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <InvoiceBlock>
                        <InvoiceNumber>{sale.invoiceNumber}</InvoiceNumber>
                        <CustomerTypeBadge>{sale.customerType}</CustomerTypeBadge>
                      </InvoiceBlock>
                    </TableCell>
                    <TableCell>
                      <CustomerName>{sale.customerName}</CustomerName>
                    </TableCell>
                    <TableCell>
                      <ItemsSummaryWrap title={sale.itemsSummary}>
                        <ItemsText>{sale.itemsSummary}</ItemsText>
                        <ItemsCount>({sale.itemCount} items)</ItemsCount>
                      </ItemsSummaryWrap>
                    </TableCell>
                    <TableCell>
                      <AmountBlock>
                        <TotalAmount>
                          ${sale.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TotalAmount>
                        {sale.paymentStatus === 'partial' && (
                          <PaidAmount>
                            Paid: ${sale.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </PaidAmount>
                        )}
                      </AmountBlock>
                    </TableCell>
                    <TableCell>
                      <StatusWrapper>
                        <Badge variant={STATUS_VARIANT[sale.paymentStatus]} size="sm" dot>
                          {sale.paymentStatus.toUpperCase()}
                        </Badge>
                        <PaymentMethodRow>
                          <PayIcon size={12} />
                          {sale.paymentMethod}
                        </PaymentMethodRow>
                      </StatusWrapper>
                    </TableCell>
                    <TableCell>
                      <DateBlock>
                        <span>{sale.date}</span>
                        <TimeText>{sale.time}</TimeText>
                      </DateBlock>
                    </TableCell>
                    <TableCell $align="right">
                      <ActionIconButton
                        title={`View receipt for ${sale.invoiceNumber}`}
                        type="button"
                      >
                        <Eye size={15} />
                      </ActionIconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </tbody>
        </Table>
      </TableWrapper>
    </Card>
  );
};
