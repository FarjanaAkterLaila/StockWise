import React, { useState, useMemo, useEffect } from "react";
import type { Sale } from "@/types";
import { fetchSales, createSale } from "@/services/sales.service";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_VALUES, APP_STRINGS } from "@/utils/constants";
import { SalesStats } from "./SalesStats";
import { SalesFilterBar } from "./SalesFilterBar";
import { SalesTable } from "./SalesTable";
import { SaleModal } from "./SaleModal";
import { SalesViewModal } from "./SalesViewModal";
import { Plus } from "lucide-react";
import {
  SalesContainer,
  TopActionHeader,
  TitleWrap,
  PageTitle,
  PageSubtitle,
  HeaderActions,
  CreateSaleBtn,
} from "./Sales.styles";

export const SalesModule: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchSales()
      .then((data) => {
        if (isMounted) {
          setSales(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch sales from Supabase:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalInvoices = sales.length;
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalPaid = sales.reduce((acc, s) => acc + s.paidAmount, 0);
    const totalDue = sales.reduce((acc, s) => acc + s.dueAmount, 0);
    return { totalInvoices, totalRevenue, totalPaid, totalDue };
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sale.invoiceNumber.toLowerCase().includes(q) ||
        sale.customerName.toLowerCase().includes(q) ||
        (sale.customerPhone && sale.customerPhone.toLowerCase().includes(q)) ||
        sale.items.some(
          (i) =>
            i.productName.toLowerCase().includes(q) ||
            i.sku.toLowerCase().includes(q),
        );

      const matchesStatus =
        selectedStatus === DEFAULT_VALUES.FILTER_ALL ||
        sale.status === selectedStatus;
      const matchesPayment =
        selectedPaymentStatus === DEFAULT_VALUES.FILTER_ALL ||
        sale.paymentStatus === selectedPaymentStatus;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [sales, searchTerm, selectedStatus, selectedPaymentStatus]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedStatus !== DEFAULT_VALUES.FILTER_ALL ||
      selectedPaymentStatus !== DEFAULT_VALUES.FILTER_ALL,
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus(DEFAULT_VALUES.FILTER_ALL);
    setSelectedPaymentStatus(DEFAULT_VALUES.FILTER_ALL);
  };

  const handleSaveSale = async (
    saleData: Omit<Sale, "id"> & { id?: string },
  ) => {
    if (saleData.id) {
      setSales((prev) =>
        prev.map((item) =>
          item.id === saleData.id ? ({ ...item, ...saleData } as Sale) : item,
        ),
      );
      setEditingSale(null);
    } else {
      try {
        await createSale(
          {
            customerId: saleData.customerId,
            items: saleData.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              sku: i.sku,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.subtotal,
            })),
            subtotal: saleData.subtotal,
            discountAmount: saleData.discountAmount,
            taxAmount: saleData.taxAmount,
            totalAmount: saleData.totalAmount,
            paidAmount: saleData.paidAmount,
            paymentMethod: saleData.paymentMethod,
            status: saleData.status,
            notes: saleData.notes,
          },
          user?.id,
        );
        const updated = await fetchSales();
        setSales(updated);
        setIsCreateModalOpen(false);
      } catch (err: unknown) {
        alert(
          (err as Error).message ||
            "Failed to process sale transaction in database",
        );
      }
    }
  };

  return (
    <SalesContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>{APP_STRINGS.salesTitle}</PageTitle>
          <PageSubtitle>{APP_STRINGS.salesSubtitle}</PageSubtitle>
        </TitleWrap>
        <HeaderActions>
          <CreateSaleBtn
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
          >
            <Plus size={16} />
            <span>{APP_STRINGS.createSaleBtn}</span>
          </CreateSaleBtn>
        </HeaderActions>
      </TopActionHeader>

      <SalesStats
        totalInvoices={stats.totalInvoices}
        totalRevenue={stats.totalRevenue}
        totalPaid={stats.totalPaid}
        totalDue={stats.totalDue}
      />

      <SalesFilterBar
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedPaymentStatus={selectedPaymentStatus}
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        onPaymentStatusChange={setSelectedPaymentStatus}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <SalesTable
        sales={filteredSales}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onView={(s: Sale) => setViewingSale(s)}
        onEdit={(s: Sale) => setEditingSale(s)}
        onDelete={() => {}}
      />

      {isCreateModalOpen && (
        <SaleModal
          isOpen={isCreateModalOpen}
          initialSale={null}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveSale}
        />
      )}

      {editingSale && (
        <SaleModal
          isOpen={Boolean(editingSale)}
          initialSale={editingSale}
          onClose={() => setEditingSale(null)}
          onSave={handleSaveSale}
        />
      )}

      {viewingSale && (
        <SalesViewModal
          isOpen={Boolean(viewingSale)}
          sale={viewingSale}
          onClose={() => setViewingSale(null)}
        />
      )}
    </SalesContainer>
  );
};
