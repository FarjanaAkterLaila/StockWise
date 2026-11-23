import { useState, useMemo } from "react";
import type { Sale } from "@/types";
import { INITIAL_SALES } from "@/data/mockData";
import { Plus } from "lucide-react";
import { SalesStats } from "./SalesStats";
import { SalesFilterBar } from "./SalesFilterBar";
import { SalesTable } from "./SalesTable";
import { SaleModal } from "./SaleModal";
import { GenericModal } from "@/components/common/GenericModal";
import { APP_STRINGS, DEFAULT_VALUES } from "@/utils/constants";
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
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);

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

  const handleSaveSale = (saleData: Omit<Sale, "id"> & { id?: string }) => {
    if (saleData.id) {
      setSales((prev) =>
        prev.map((item) =>
          item.id === saleData.id ? ({ ...item, ...saleData } as Sale) : item,
        ),
      );
      setEditingSale(null);
    } else {
      const newSale: Sale = {
        ...saleData,
        id: `sale-${Date.now()}`,
      };
      setSales((prev) => [newSale, ...prev]);
      setIsCreateModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingSale) {
      setSales((prev) => prev.filter((s) => s.id !== deletingSale.id));
      setDeletingSale(null);
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
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPaymentStatus={selectedPaymentStatus}
        onPaymentStatusChange={setSelectedPaymentStatus}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      <SalesTable
        sales={filteredSales}
        totalAllCount={sales.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onEdit={(sale) => setEditingSale(sale)}
        onDelete={(sale) => setDeletingSale(sale)}
      />

      {(isCreateModalOpen || editingSale) && (
        <SaleModal
          key={editingSale ? editingSale.id : "new-sale-modal"}
          isOpen={isCreateModalOpen || Boolean(editingSale)}
          initialSale={editingSale}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingSale(null);
          }}
          onSave={handleSaveSale}
        />
      )}

      {deletingSale && (
        <GenericModal
          isOpen={Boolean(deletingSale)}
          onClose={() => setDeletingSale(null)}
          variant="danger"
          size="sm"
          title={APP_STRINGS.deleteSaleTitle}
          message={`Are you sure you want to delete invoice "${deletingSale.invoiceNumber}" for ${deletingSale.customerName}? This operation will remove the transaction record.`}
          confirmText={APP_STRINGS.deleteSaleConfirm}
          cancelText={APP_STRINGS.cancel}
          onConfirm={handleConfirmDelete}
        />
      )}
    </SalesContainer>
  );
};
