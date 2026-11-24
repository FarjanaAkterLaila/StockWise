import type { ExpenseCategory, PaymentMethod } from "@/types";

export interface ExpenseFormData {
  title: string;
  category: ExpenseCategory;
  amount: string;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  recipient?: string;
  referenceNumber?: string;
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

  if (!data.category) {
    errors.category = "Category is required";
  }

  const amt = parseFloat(data.amount);
  if (isNaN(amt) || amt <= 0) {
    errors.amount = "Valid expense amount is required (greater than 0)";
  }

  if (!data.date.trim()) {
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
