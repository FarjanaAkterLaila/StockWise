import React, { useState, useMemo, useEffect } from "react";
import type { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { hasPermission } from "@/utils/permissions";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
} from "@/services/products.service";
import {
  PRODUCT_STATUS,
  PRODUCT_STATUS_FILTER,
  STOCK_STATUS,
} from "@/utils/constants";
import { InventoryFilterBar } from "./InventoryFilterBar";
import { InventoryStats } from "./InventoryStats";
import { InventoryTable } from "./InventoryTable";
import { ProductModal } from "./ProductModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Plus } from "lucide-react";
import { GenericLoader } from "@/components/common/GenericLoader";
import {
  InventoryContainer,
  TopActionHeader,
  TitleWrap,
  PageTitle,
  PageSubtitle,
  AddProductBtn,
} from "./Inventory.styles";

export const InventoryModule: React.FC = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user?.role, "inventory", "create");
  const canEdit = hasPermission(user?.role, "inventory", "edit");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState<string>(STOCK_STATUS.ALL);
  const [statusFilter, setStatusFilter] = useState<string>(
    PRODUCT_STATUS_FILTER.ACTIVE_CATALOG,
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [archivingProduct, setArchivingProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch products from Supabase:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const catalogProducts = products.filter(
      (p) => p.status !== PRODUCT_STATUS.ARCHIVED,
    );
    const totalCount = catalogProducts.length;
    const totalUnits = catalogProducts.reduce(
      (acc, p) => acc + p.stockQuantity,
      0,
    );
    const totalValuation = catalogProducts.reduce(
      (acc, p) => acc + p.costPrice * p.stockQuantity,
      0,
    );
    const lowStockCount = catalogProducts.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel,
    ).length;
    return { totalCount, totalUnits, totalValuation, lowStockCount };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        (prod.barcode && prod.barcode.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "All" || prod.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === STOCK_STATUS.IN_STOCK) {
        matchesStock = prod.stockQuantity > prod.minStockLevel;
      } else if (stockFilter === STOCK_STATUS.LOW) {
        matchesStock =
          prod.stockQuantity > 0 && prod.stockQuantity <= prod.minStockLevel;
      } else if (stockFilter === STOCK_STATUS.OUT) {
        matchesStock = prod.stockQuantity === 0;
      }

      let matchesStatus = true;
      if (statusFilter === PRODUCT_STATUS_FILTER.ACTIVE_CATALOG) {
        matchesStatus = prod.status !== PRODUCT_STATUS.ARCHIVED;
      } else if (statusFilter === PRODUCT_STATUS_FILTER.ACTIVE) {
        matchesStatus = prod.status === PRODUCT_STATUS.ACTIVE;
      } else if (statusFilter === PRODUCT_STATUS_FILTER.INACTIVE) {
        matchesStatus = prod.status === PRODUCT_STATUS.INACTIVE;
      } else if (statusFilter === PRODUCT_STATUS_FILTER.ARCHIVED) {
        matchesStatus = prod.status === PRODUCT_STATUS.ARCHIVED;
      }

      return matchesSearch && matchesCat && matchesStock && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, stockFilter, statusFilter]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedCategory !== "All" ||
      stockFilter !== STOCK_STATUS.ALL ||
      statusFilter !== PRODUCT_STATUS_FILTER.ACTIVE_CATALOG,
  );

  const { showSuccess, showError } = useToast();

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setStockFilter(STOCK_STATUS.ALL);
    setStatusFilter(PRODUCT_STATUS_FILTER.ACTIVE_CATALOG);
  };

  const handleSaveProduct = async (
    formData: Omit<Product, "id"> & { id?: string },
  ) => {
    try {
      if (formData.id) {
        if (!canEdit) {
          showError("Access Denied", "You do not have permission to edit products.");
          return;
        }
        const updated = await updateProduct(formData.id, formData);
        setProducts((prev) =>
          prev.map((item) =>
            item.id === formData.id ? { ...item, ...updated } : item,
          ),
        );
        setEditingProduct(null);
        showSuccess("Product Updated", `"${formData.name}" has been updated.`);
      } else {
        if (!canCreate) {
          showError("Access Denied", "You do not have permission to create products.");
          return;
        }
        const created = await createProduct(formData);
        setProducts((prev) => [created, ...prev]);
        setIsAddModalOpen(false);
        showSuccess("Product Created", `"${created.name}" added to inventory.`);
      }
    } catch (err: unknown) {
      showError(
        "Product Save Failed",
        (err as Error).message || "Failed to save product in database",
      );
    }
  };

  const handleArchiveProduct = async (product: Product) => {
    if (!canEdit) {
      showError("Access Denied", "You do not have permission to archive products.");
      setArchivingProduct(null);
      return;
    }

    try {
      const updated = await archiveProduct(product.id);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, ...updated, status: PRODUCT_STATUS.ARCHIVED }
            : item,
        ),
      );
      setArchivingProduct(null);
      showSuccess(
        "Product Archived",
        `"${product.name}" is hidden from new Sales and Purchases while preserving historical records.`,
      );
    } catch (err: unknown) {
      showError(
        "Archive Failed",
        (err as Error).message || "Failed to archive product in database",
      );
    }
  };

  const handleRestoreProduct = async (product: Product) => {
    if (!canEdit) {
      showError("Access Denied", "You do not have permission to restore products.");
      return;
    }

    try {
      const updated = await restoreProduct(product.id);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, ...updated, status: PRODUCT_STATUS.ACTIVE }
            : item,
        ),
      );
      showSuccess(
        "Product Restored",
        `"${product.name}" is active again and available for Sales and Purchases.`,
      );
    } catch (err: unknown) {
      showError(
        "Restore Failed",
        (err as Error).message || "Failed to restore product in database",
      );
    }
  };

  return (
    <InventoryContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>Hardware &amp; Component Inventory</PageTitle>
          <PageSubtitle>
            Multiplan Computer City real-time stock levels &amp; pricing
          </PageSubtitle>
        </TitleWrap>
        {canCreate && (
          <AddProductBtn onClick={() => setIsAddModalOpen(true)} type="button">
            <Plus size={16} />
            <span>Add New Product</span>
          </AddProductBtn>
        )}
      </TopActionHeader>

      {loading ? (
        <GenericLoader
          message="Loading inventory components..."
          subtext="Fetching hardware items and stock levels from Supabase"
        />
      ) : (
        <>
          <InventoryStats
            totalCount={stats.totalCount}
            totalUnits={stats.totalUnits}
            lowStockCount={stats.lowStockCount}
            totalValuation={stats.totalValuation}
          />

          <InventoryFilterBar
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            selectedStatusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />

          <InventoryTable
            products={filteredProducts}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onEdit={canEdit ? (p) => setEditingProduct(p) : undefined}
            onArchive={canEdit ? (p) => setArchivingProduct(p) : undefined}
            onRestore={canEdit ? handleRestoreProduct : undefined}
          />
        </>
      )}

      {isAddModalOpen && (
        <ProductModal
          isOpen={isAddModalOpen}
          initialProduct={null}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {editingProduct && (
        <ProductModal
          key={editingProduct.id}
          isOpen={Boolean(editingProduct)}
          initialProduct={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
        />
      )}

      {archivingProduct && (
        <DeleteConfirmModal
          isOpen={Boolean(archivingProduct)}
          product={archivingProduct}
          onClose={() => setArchivingProduct(null)}
          onConfirm={() => handleArchiveProduct(archivingProduct)}
        />
      )}
    </InventoryContainer>
  );
};
