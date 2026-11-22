export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const calculateMargin = (sellingPrice: number, costPrice: number): number => {
  if (sellingPrice <= 0) return 0;
  return Math.round(((sellingPrice - costPrice) / sellingPrice) * 100);
};

export const calculateStockPercentage = (currentStock: number, minStock: number): number => {
  if (minStock <= 0) return 100;
  return Math.round((currentStock / minStock) * 100);
};
