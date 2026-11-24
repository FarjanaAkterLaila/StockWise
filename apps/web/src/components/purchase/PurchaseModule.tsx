import React, { useState, useMemo, useEffect, useRef } from "react";
import type { Purchase } from "@/types";
import {
  fetchPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "@/services/purchases.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { DEFAULT_VALUES, APP_STRINGS } from "@/utils/constants";
import { hasPermission } from "@/utils/permissions";
import { PurchaseStats } from "./PurchaseStats";
import { PurchaseFilterBar } from "./PurchaseFilterBar";
import { PurchaseTable } from "./PurchaseTable";
import { PurchaseModal } from "./PurchaseModal";
import { PurchaseViewModal } from "./PurchaseViewModal";
import { Plus } from "lucide-react";
import { GenericLoader } from "@/components/common/GenericLoader";
import { GenericModal } from "@/components/common/GenericModal";
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
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const canCreate = hasPermission(user?.role, "purchase", "create");
  const canEdit = hasPermission(user?.role, "purchase", "edit");
  const canDelete = hasPermission(user?.role, "purchase", "delete");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [deletingPurchase, setDeletingPurchase] = useState<Purchase | null>(null);
  const savingPurchaseRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    fetchPurchases()
      .then((data) => {
        if (isMounted) {
          setPurchases(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch purchases from Supabase:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleSavePurchase = async (
    purchaseData: Omit<Purchase, "id"> & {
      id?: string;
      newPaymentAmount?: number;
      paymentReference?: string;
    },
  ): Promise<boolean> => {
    if (savingPurchaseRef.current) return false;
    savingPurchaseRef.current = true;

    try {
      if (purchaseData.id) {
        if (!canEdit) {
          showError("Access Denied", "You do not have permission to edit purchases.");
          return false;
        }
        try {
          await updatePurchase(purchaseData.id, {
            purchaseNumber: purchaseData.purchaseNumber,
            supplierId: purchaseData.supplierId,
            supplierName: purchaseData.supplierName,
            date: purchaseData.date,
            paymentMethod: purchaseData.paymentMethod,
            items: purchaseData.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              sku: i.sku,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.subtotal,
            })),
            notes: purchaseData.notes,
            totalAmount: purchaseData.grandTotal,
            newPaymentAmount: purchaseData.newPaymentAmount,
            paymentReference: purchaseData.paymentReference,
            discountAmount: purchaseData.discountAmount,
            vatRate: purchaseData.vatRate,
            vatAmount: purchaseData.vatAmount,
            status: purchaseData.status,
          });
          const updated = await fetchPurchases();
          setPurchases(updated);
          setEditingPurchase(null);
          showSuccess("Purchase Updated", "Purchase order details updated.");
          return true;
        } catch (err: unknown) {
          showError(
            "Update Failed",
            (err as Error).message || "Failed to update purchase order.",
          );
          return false;
        }
      } else {
        if (!canCreate) {
          showError("Access Denied", "You do not have permission to create purchases.");
          return false;
        }
        try {
          const created = await createPurchase(
            {
              purchaseNumber: purchaseData.purchaseNumber,
              supplierId: purchaseData.supplierId,
              supplierName: purchaseData.supplierName,
              items: purchaseData.items.map((i) => ({
                productId: i.productId,
                productName: i.productName,
                sku: i.sku,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                subtotal: i.subtotal,
              })),
              totalAmount: purchaseData.grandTotal,
              paidAmount: purchaseData.paidAmount,
              paymentReference: purchaseData.paymentReference,
              discountAmount: purchaseData.discountAmount,
              vatRate: purchaseData.vatRate,
              vatAmount: purchaseData.vatAmount,
              paymentMethod: purchaseData.paymentMethod,
              status: purchaseData.status,
              notes: purchaseData.notes,
            },
            user?.id,
          );

          // 1. Immediately update UI state so new purchase displays instantly without reload
          setPurchases((prev) => [
            created,
            ...prev.filter((p) => p.id !== created.id),
          ]);
          // 2. Close modal immediately
          setIsCreateModalOpen(false);
          // 3. Display success toast
          showSuccess(
            "Purchase Order Created",
            `PO #${created.purchaseNumber} created successfully.`,
          );

          // 4. Background refresh to sync any server-computed fields
          fetchPurchases()
            .then((fresh) => {
              if (fresh && fresh.length > 0) setPurchases(fresh);
            })
            .catch((e) => console.warn("Background fetch warning:", e));
          return true;
        } catch (err: unknown) {
          showError(
            "Purchase Order Failed",
            (err as Error).message ||
              "Failed to create purchase order in database",
          );
          return false;
        }
      }
    } finally {
      savingPurchaseRef.current = false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPurchase) return;
    if (!canDelete) {
      showError("Access Denied", "You do not have permission to delete purchases.");
      setDeletingPurchase(null);
      return;
    }
    const poNumber = deletingPurchase.purchaseNumber;
    const id = deletingPurchase.id;
    try {
      await deletePurchase(id);
      setPurchases((prev) => prev.filter((p) => p.id !== id));
      setDeletingPurchase(null);
      showSuccess(
        "Purchase Deleted",
        `Purchase Order #${poNumber} deleted successfully.`,
      );
    } catch (err: unknown) {
      showError(
        "Delete Failed",
        (err as Error).message || "Failed to delete purchase order.",
      );
    }
  };

  return (
    <PurchaseContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>{APP_STRINGS.purchaseTitle}</PageTitle>
          <PageSubtitle>{APP_STRINGS.purchaseSubtitle}</PageSubtitle>
        </TitleWrap>
        {canCreate && (
          <HeaderActions>
            <CreatePurchaseBtn
              onClick={() => setIsCreateModalOpen(true)}
              type="button"
            >
              <Plus size={16} />
              <span>{APP_STRINGS.createPurchaseBtn}</span>
            </CreatePurchaseBtn>
          </HeaderActions>
        )}
      </TopActionHeader>

      {loading ? (
        <GenericLoader
          message="Loading purchase orders..."
          subtext="Fetching vendor restock orders and intake status"
        />
      ) : (
        <>
          <PurchaseStats
            totalOrders={stats.totalOrders}
            totalExpense={stats.totalExpense}
            totalPaid={stats.totalPaid}
            totalDue={stats.totalDue}
          />

          <PurchaseFilterBar
            searchTerm={searchTerm}
            selectedSupplier={selectedSupplier}
            selectedStatus={selectedStatus}
            selectedPaymentStatus={selectedPaymentStatus}
            onSearchChange={setSearchTerm}
            onSupplierChange={setSelectedSupplier}
            onStatusChange={setSelectedStatus}
            onPaymentStatusChange={setSelectedPaymentStatus}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <PurchaseTable
            purchases={filteredPurchases}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onView={(p: Purchase) => setViewingPurchase(p)}
            onEdit={canEdit ? (p: Purchase) => setEditingPurchase(p) : undefined}
            onDelete={canDelete ? (p: Purchase) => setDeletingPurchase(p) : undefined}
          />
        </>
      )}

      {isCreateModalOpen && (
        <PurchaseModal
          isOpen={isCreateModalOpen}
          initialPurchase={null}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSavePurchase}
        />
      )}

      {editingPurchase && (
        <PurchaseModal
          key={editingPurchase.id}
          isOpen={Boolean(editingPurchase)}
          initialPurchase={editingPurchase}
          onClose={() => setEditingPurchase(null)}
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
          title="Delete Purchase Order"
          message={`Are you sure you want to delete purchase order #${deletingPurchase.purchaseNumber}? This will reverse received stock.`}
          confirmText="Delete Order"
          cancelText={APP_STRINGS.cancel}
          onConfirm={handleConfirmDelete}
        />
      )}
    </PurchaseContainer>
  );
};
