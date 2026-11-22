export const HARDWARE_CATEGORIES = [
  'All',
  'Graphics Cards',
  'Processors',
  'Motherboards',
  'Memory (RAM)',
  'Storage',
  'Power Supply',
  'Monitors & Displays',
  'Peripherals & Accessories',
] as const;

export const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'kits', label: 'Kits (dual-channel)' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
] as const;

export const STOCK_FILTER_OPTIONS = [
  { value: 'all', label: 'All Stock Levels' },
  { value: 'in_stock', label: 'In Stock (> Min)' },
  { value: 'low', label: 'Low Stock Alert' },
  { value: 'out', label: 'Out of Stock (0)' },
] as const;

export const APP_STRINGS = {
  storeName: 'Apex Hardware & PC',
  storeBranch: 'Main Branch • POS-1',
  inventoryTitle: 'Inventory & Product Catalog',
  inventorySubtitle: 'Manage computer hardware SKUs, stock levels, barcodes, cost and retail pricing',
  addProductBtn: 'Add Product',
  reorderBtn: 'Reorder',
  resetFilters: 'Reset',
  searchPlaceholder: 'Search by product name, SKU or barcode...',
  emptyTitle: 'No Products Found',
  emptyDesc: 'No hardware components match your search or filter settings. Try adjusting your search keyword or clearing the category filter.',
  deleteTitle: 'Delete Product?',
  deleteConfirm: 'Delete Product',
  cancel: 'Cancel',
  saveChanges: 'Save Changes',
  createProduct: 'Create Product',
} as const;
