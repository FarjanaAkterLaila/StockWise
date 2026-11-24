import React, { useState, useMemo, useEffect } from "react";
import type { Sale } from "@/types";
import { fetchSales, createSale, updateSale, deleteSale } from "@/services/sales.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { DEFAULT_VALUES, APP_STRINGS } from "@/utils/constants";
import { hasPermission, normalizeRole } from "@/utils/permissions";
import { SalesStats } from "./SalesStats";
import { SalesFilterBar } from "./SalesFilterBar";
import { SalesTable } from "./SalesTable";
import { SaleModal } from "./SaleModal";
import { SalesViewModal } from "./SalesViewModal";
import { Plus } from "lucide-react";
import { GenericLoader } from "@/components/common/GenericLoader";
import { GenericModal } from "@/components/common/GenericModal";
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
  const { showSuccess, showError } = useToast();
  const canCreate = hasPermission(user?.role, "sales", "create");
  const canEdit = hasPermission(user?.role, "sales", "edit");
  const canDelete = hasPermission(user?.role, "sales", "delete");
  const isStaff = normalizeRole(user?.role) === "staff";
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);

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
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleSales = useMemo(() => {
    if (!isStaff) return sales;
    return sales.filter((sale) => sale.createdBy === user?.id);
  }, [sales, isStaff, user?.id]);

  const stats = useMemo(() => {
    const totalInvoices = visibleSales.length;
    const totalRevenue = visibleSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalPaid = visibleSales.reduce((acc, s) => acc + s.paidAmount, 0);
    const totalDue = visibleSales.reduce((acc, s) => acc + s.dueAmount, 0);
    return { totalInvoices, totalRevenue, totalPaid, totalDue };
  }, [visibleSales]);

  const filteredSales = useMemo(() => {
    return visibleSales.filter((sale) => {
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
  }, [visibleSales, searchTerm, selectedStatus, selectedPaymentStatus]);

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
    saleData: Omit<Sale, "id"> & {
      id?: string;
      newPaymentAmount?: number;
      paymentDate?: string;
      paymentReferenceNumber?: string;
    },
  ) => {
    if (saleData.id) {
      if (!canEdit) {
        showError("Access Denied", "You do not have permission to edit sales.");
        return;
      }
      try {
        await updateSale(saleData.id, {
          notes: saleData.notes,
          totalAmount: saleData.totalAmount,
          newPaymentAmount: saleData.newPaymentAmount || 0,
          paymentMethod: saleData.paymentMethod,
          paymentDate: saleData.paymentDate,
          referenceNumber: saleData.paymentReferenceNumber,
          status: saleData.status,
        });
        const updated = await fetchSales();
        setSales(updated);
        setEditingSale(null);
        showSuccess("Sale Updated", "Invoice details updated successfully.");
      } catch (err: unknown) {
        showError(
          "Update Failed",
          (err as Error).message || "Failed to update sale.",
        );
      }
    } else {
      if (!canCreate) {
        showError("Access Denied", "You do not have permission to create sales.");
        return;
      }
      try {
        await createSale(
          {
            customerId: saleData.customerId,
            customerName: saleData.customerName,
            customerPhone: saleData.customerPhone,
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

        setIsCreateModalOpen(false);
        showSuccess("Sale Completed", "Invoice created successfully.");

        // Fetch fresh sales list
        fetchSales()
          .then((updated) => setSales(updated))
          .catch(() => { });
      } catch (err: unknown) {
        showError(
          "Transaction Failed",
          (err as Error).message ||
          "Failed to process sale transaction in database",
        );
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSale) return;
    if (!canDelete) {
      showError("Access Denied", "You do not have permission to delete sales.");
      setDeletingSale(null);
      return;
    }
    const invNumber = deletingSale.invoiceNumber;
    const id = deletingSale.id;
    try {
      await deleteSale(id);
      setSales((prev) => prev.filter((s) => s.id !== id));
      setDeletingSale(null);
      showSuccess(
        "Sale Deleted",
        `Invoice #${invNumber} removed and stock restored.`,
      );
    } catch (err: unknown) {
      showError(
        "Delete Failed",
        (err as Error).message || "Failed to delete sale from database.",
      );
    }
  };

  return (
    <SalesContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>{APP_STRINGS.salesTitle}</PageTitle>
          <PageSubtitle>{APP_STRINGS.salesSubtitle}</PageSubtitle>
        </TitleWrap>
        {canCreate && (
          <HeaderActions>
            <CreateSaleBtn
              onClick={() => setIsCreateModalOpen(true)}
              type="button"
            >
              <Plus size={16} />
              <span>{APP_STRINGS.createSaleBtn}</span>
            </CreateSaleBtn>
          </HeaderActions>
        )}
      </TopActionHeader>

      {loading ? (
        <GenericLoader
          message="Loading sales & invoices..."
          subtext="Retrieving point-of-sale transactions and billing records"
        />
      ) : (
        <>
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
            onEdit={canEdit ? (s: Sale) => setEditingSale(s) : undefined}
            onDelete={canDelete ? (s: Sale) => setDeletingSale(s) : undefined}
          />
        </>
      )}

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
          key={editingSale.id}
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

      {deletingSale && (
        <GenericModal
          isOpen={Boolean(deletingSale)}
          onClose={() => setDeletingSale(null)}
          variant="danger"
          size="sm"
          title="Delete Sales Invoice"
          message={`Are you sure you want to delete invoice #${deletingSale.invoiceNumber}? This will restore product stock.`}
          confirmText="Delete Invoice"
          cancelText={APP_STRINGS.cancel}
          onConfirm={handleConfirmDelete}
        />
      )}
    </SalesContainer>
  );
};
