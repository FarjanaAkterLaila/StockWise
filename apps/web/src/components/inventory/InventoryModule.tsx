import React, { useState, useMemo, useEffect } from "react";
import type { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { hasPermission } from "@/utils/permissions";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products.service";
import { STOCK_STATUS } from "@/utils/constants";
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
  const canDelete = hasPermission(user?.role, "inventory", "delete");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState<string>(STOCK_STATUS.ALL);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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
    const totalCount = products.length;
    const totalUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
    const totalValuation = products.reduce(
      (acc, p) => acc + p.costPrice * p.stockQuantity,
      0,
    );
    const lowStockCount = products.filter(
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

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedCategory !== "All" ||
      stockFilter !== STOCK_STATUS.ALL,
  );

  const { showSuccess, showError } = useToast();

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setStockFilter(STOCK_STATUS.ALL);
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

  const handleConfirmDelete = async () => {
    if (deletingProduct) {
      if (!canDelete) {
        showError("Access Denied", "You do not have permission to delete products.");
        setDeletingProduct(null);
        return;
      }
      const prodName = deletingProduct.name;
      try {
        await deleteProduct(deletingProduct.id);
        setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
        setDeletingProduct(null);
        showSuccess("Product Deleted", `"${prodName}" removed from inventory.`);
      } catch (err: unknown) {
        showError(
          "Delete Failed",
          (err as Error).message || "Failed to delete product from database",
        );
      }
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
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />

          <InventoryTable
            products={filteredProducts}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onEdit={canEdit ? (p) => setEditingProduct(p) : undefined}
            onDelete={canDelete ? (p) => setDeletingProduct(p) : undefined}
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

      {deletingProduct && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingProduct)}
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </InventoryContainer>
  );
};
