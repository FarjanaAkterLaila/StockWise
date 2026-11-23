export const formatCurrency = (amount: number): string => {
  return `৳${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    const val = (amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1);
    return `৳${val}Cr`;
  }
  if (amount >= 1000000) {
    const val = (amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1);
    return `৳${val}M`;
  }
  if (amount >= 1000) {
    const val = (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1);
    return `৳${val}k`;
  }
  return `৳${amount}`;
};

export const formatDate = (dateStringOrDate: string | Date): string => {
  if (!dateStringOrDate) return "";
  const d = new Date(dateStringOrDate);
  if (isNaN(d.getTime())) return String(dateStringOrDate);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatTime = (timeStringOrDate?: string | Date): string => {
  if (!timeStringOrDate) {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    });
  }
  if (
    typeof timeStringOrDate === "string" &&
    (timeStringOrDate.includes("AM") || timeStringOrDate.includes("PM"))
  ) {
    return timeStringOrDate;
  }
  const d = new Date(timeStringOrDate);
  if (isNaN(d.getTime())) return String(timeStringOrDate);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });
};

export const calculateMargin = (
  sellingPrice: number,
  costPrice: number,
): number => {
  if (sellingPrice <= 0) return 0;
  return Math.round(((sellingPrice - costPrice) / sellingPrice) * 100);
};

export const calculateStockPercentage = (
  currentStock: number,
  minStock: number,
): number => {
  if (minStock <= 0) return 100;
  return Math.round((currentStock / minStock) * 100);
};
