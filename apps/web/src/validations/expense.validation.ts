import type { AccountsPaymentMethod, ExpenseCategory } from "@/types";
import { EXPENSE_CATEGORIES } from "@/utils/constants";

export interface ExpenseFormData {
  title: string;
  category: ExpenseCategory;
  amount: string;
  date: string;
  paymentMethod: AccountsPaymentMethod;
}

export const validateExpenseForm = (
  data: ExpenseFormData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.title.trim()) {
    errors.title = "Expense title is required";
  } else if (data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (!data.category || !EXPENSE_CATEGORIES.includes(data.category)) {
    errors.category = "Category is required";
  }

  const amt = Number(data.amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    errors.amount = "Valid expense amount is required (greater than 0)";
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data.date);
  const dateParts = dateMatch?.slice(1).map(Number);
  const dateObject = dateParts
    ? new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]))
    : null;
  if (!dateObject
    || dateObject.getUTCFullYear() !== dateParts?.[0]
    || dateObject.getUTCMonth() !== (dateParts?.[1] ?? 0) - 1
    || dateObject.getUTCDate() !== dateParts?.[2]) {
    errors.date = "Date is required";
  }

  if (!data.paymentMethod) {
    errors.paymentMethod = "Payment method is required";
  }

  return errors;
};

export const isExpenseFormValid = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length === 0;
};
