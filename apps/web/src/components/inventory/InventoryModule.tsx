import { useState, useMemo } from "react";
import type { Product } from "@/types";
import { INITIAL_PRODUCTS } from "@/data/mockData";
import { Plus } from "lucide-react";
import { InventoryStats } from "./InventoryStats";
import { InventoryFilterBar } from "./InventoryFilterBar";
import { InventoryTable } from "./InventoryTable";
import { ProductModal } from "./ProductModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { APP_STRINGS, STOCK_STATUS, PRODUCT_STATUS } from "@/utils/constants";
import {
  InventoryContainer,
  TopActionHeader,
  TitleWrap,
  PageTitle,
  PageSubtitle,
  HeaderActions,
  AddProductBtn,
} from "./Inventory.styles";

export const InventoryModule: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState<string>(STOCK_STATUS.ALL);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setStockFilter(STOCK_STATUS.ALL);
  };

  const handleSaveProduct = (
    formData: Omit<Product, "id"> & { id?: string },
  ) => {
    if (formData.id) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? ({ ...item, ...formData } as Product)
            : item,
        ),
      );
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        ...formData,
        id: `prod-${Date.now()}`,
        status: formData.status || PRODUCT_STATUS.ACTIVE,
      };
      setProducts((prev) => [newProduct, ...prev]);
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    }
  };

  return (
    <InventoryContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>{APP_STRINGS.inventoryTitle}</PageTitle>
          <PageSubtitle>{APP_STRINGS.inventorySubtitle}</PageSubtitle>
        </TitleWrap>
        <HeaderActions>
          <AddProductBtn onClick={() => setIsAddModalOpen(true)} type="button">
            <Plus size={16} />
            <span>{APP_STRINGS.addProductBtn}</span>
          </AddProductBtn>
        </HeaderActions>
      </TopActionHeader>

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
        totalAllCount={products.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onEdit={(prod) => setEditingProduct(prod)}
        onDelete={(prod) => setDeletingProduct(prod)}
      />

      {(isAddModalOpen || editingProduct) && (
        <ProductModal
          key={editingProduct ? editingProduct.id : "new-product-modal"}
          isOpen={isAddModalOpen || Boolean(editingProduct)}
          initialProduct={editingProduct}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
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
