import React, { useState, useMemo, useEffect } from "react";
import type { Purchase } from "@/types";
import {
  fetchPurchases,
  createPurchase,
} from "@/services/purchases.service";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_VALUES, APP_STRINGS } from "@/utils/constants";
import { PurchaseStats } from "./PurchaseStats";
import { PurchaseFilterBar } from "./PurchaseFilterBar";
import { PurchaseTable } from "./PurchaseTable";
import { PurchaseModal } from "./PurchaseModal";
import { PurchaseViewModal } from "./PurchaseViewModal";
import { Plus } from "lucide-react";
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
  const [purchases, setPurchases] = useState<Purchase[]>([]);
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
      try {
        await createPurchase(
          {
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
            paymentMethod: purchaseData.paymentMethod,
            status: purchaseData.status,
            notes: purchaseData.notes,
          },
          user?.id,
        );
        const updated = await fetchPurchases();
        setPurchases(updated);
        setIsCreateModalOpen(false);
      } catch (err: unknown) {
        alert(
          (err as Error).message ||
            "Failed to create purchase order in database",
        );
      }
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
        onEdit={(p: Purchase) => setEditingPurchase(p)}
        onDelete={() => {}}
      />

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
    </PurchaseContainer>
  );
};
