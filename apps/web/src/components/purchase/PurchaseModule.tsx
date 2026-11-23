import { useState, useMemo } from "react";
import type { Purchase } from "@/types";
import { INITIAL_PURCHASES } from "@/data/mockData";
import { Plus } from "lucide-react";
import { PurchaseStats } from "./PurchaseStats";
import { PurchaseFilterBar } from "./PurchaseFilterBar";
import { PurchaseTable } from "./PurchaseTable";
import { PurchaseModal } from "./PurchaseModal";
import { PurchaseViewModal } from "./PurchaseViewModal";
import { GenericModal } from "@/components/common/GenericModal";
import { APP_STRINGS, DEFAULT_VALUES } from "@/utils/constants";
import {
  PurchaseContainer,
  TopActionHeader,
  TitleWrap,
  PageTitle,
  PageSubtitle,
  HeaderActions,
  CreatePurchaseBtn,
} from "./Purchase.styles";

export const PurchaseModule: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<Purchase | null>(
    null,
  );

  const stats = useMemo(() => {
    const totalOrders = purchases.length;
    const totalExpense = purchases.reduce((acc, p) => acc + p.grandTotal, 0);
    const totalPaid = purchases.reduce((acc, p) => acc + p.paidAmount, 0);
    const totalDue = purchases.reduce((acc, p) => acc + p.dueAmount, 0);
    return { totalOrders, totalExpense, totalPaid, totalDue };
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        purchase.purchaseNumber.toLowerCase().includes(q) ||
        purchase.supplierName.toLowerCase().includes(q) ||
        purchase.items.some(
          (i) =>
            i.productName.toLowerCase().includes(q) ||
            i.sku.toLowerCase().includes(q),
        );

      const matchesSupplier =
        selectedSupplier === DEFAULT_VALUES.FILTER_ALL ||
        purchase.supplierId === selectedSupplier;

      const matchesStatus =
        selectedStatus === DEFAULT_VALUES.FILTER_ALL ||
        purchase.status === selectedStatus;

      const matchesPayment =
        selectedPaymentStatus === DEFAULT_VALUES.FILTER_ALL ||
        purchase.paymentStatus === selectedPaymentStatus;

      return (
        matchesSearch && matchesSupplier && matchesStatus && matchesPayment
      );
    });
  }, [
    purchases,
    searchTerm,
    selectedSupplier,
    selectedStatus,
    selectedPaymentStatus,
  ]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedSupplier !== DEFAULT_VALUES.FILTER_ALL ||
    selectedStatus !== DEFAULT_VALUES.FILTER_ALL ||
    selectedPaymentStatus !== DEFAULT_VALUES.FILTER_ALL,
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSupplier(DEFAULT_VALUES.FILTER_ALL);
    setSelectedStatus(DEFAULT_VALUES.FILTER_ALL);
    setSelectedPaymentStatus(DEFAULT_VALUES.FILTER_ALL);
  };

  const handleSavePurchase = (
    purchaseData: Omit<Purchase, "id"> & { id?: string },
  ) => {
    if (purchaseData.id) {
      setPurchases((prev) =>
        prev.map((item) =>
          item.id === purchaseData.id
            ? ({ ...item, ...purchaseData } as Purchase)
            : item,
        ),
      );
      setEditingPurchase(null);
    } else {
      const newPurchase: Purchase = {
        ...purchaseData,
        id: `po-${Date.now()}`,
      };
      setPurchases((prev) => [newPurchase, ...prev]);
      setIsCreateModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingPurchase) {
      setPurchases((prev) => prev.filter((p) => p.id !== deletingPurchase.id));
      setDeletingPurchase(null);
    }
  };

  return (
    <PurchaseContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>{APP_STRINGS.purchaseTitle}</PageTitle>
          <PageSubtitle>{APP_STRINGS.purchaseSubtitle}</PageSubtitle>
        </TitleWrap>
        <HeaderActions>
          <CreatePurchaseBtn
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
          >
            <Plus size={16} />
            <span>{APP_STRINGS.createPurchaseBtn}</span>
          </CreatePurchaseBtn>
        </HeaderActions>
      </TopActionHeader>

      <PurchaseStats
        totalOrders={stats.totalOrders}
        totalExpense={stats.totalExpense}
        totalPaid={stats.totalPaid}
        totalDue={stats.totalDue}
      />

      <PurchaseFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSupplier={selectedSupplier}
        onSupplierChange={setSelectedSupplier}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPaymentStatus={selectedPaymentStatus}
        onPaymentStatusChange={setSelectedPaymentStatus}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      <PurchaseTable
        purchases={filteredPurchases}
        totalAllCount={purchases.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onView={(purchase) => setViewingPurchase(purchase)}
        onEdit={(purchase) => setEditingPurchase(purchase)}
        onDelete={(purchase) => setDeletingPurchase(purchase)}
      />

      {(isCreateModalOpen || editingPurchase) && (
        <PurchaseModal
          key={editingPurchase ? editingPurchase.id : "new-purchase-modal"}
          isOpen={isCreateModalOpen || Boolean(editingPurchase)}
          initialPurchase={editingPurchase}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingPurchase(null);
          }}
          onSave={handleSavePurchase}
        />
      )}

      {viewingPurchase && (
        <PurchaseViewModal
          isOpen={Boolean(viewingPurchase)}
          purchase={viewingPurchase}
          onClose={() => setViewingPurchase(null)}
        />
      )}

      {deletingPurchase && (
        <GenericModal
          isOpen={Boolean(deletingPurchase)}
          onClose={() => setDeletingPurchase(null)}
          variant="danger"
          size="sm"
          title={APP_STRINGS.deletePurchaseTitle}
          message={`Are you sure you want to delete purchase order "${deletingPurchase.purchaseNumber}" from ${deletingPurchase.supplierName}? This operation will remove the vendor procurement record.`}
          confirmText={APP_STRINGS.deletePurchaseConfirm}
          cancelText={APP_STRINGS.cancel}
          onConfirm={handleConfirmDelete}
        />
      )}
    </PurchaseContainer>
  );
};
