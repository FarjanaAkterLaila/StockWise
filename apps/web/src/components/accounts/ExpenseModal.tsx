import React, { useState, useRef } from "react";
import type { AccountsPaymentMethod, Expense, ExpenseCategory } from "@/types";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import { ACCOUNTS_PAYMENT_METHODS } from "@/utils/accounts.utils";
import { validateExpenseForm, type ExpenseFormData } from "@/validations/expense.validation";
import { ModalForm } from "@/components/common/ModalForm";
import { CustomSelect } from "@/components/common/CustomSelect";
import {
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
} from "./Accounts.styles";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => Promise<boolean>;
  initialExpense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
}) => {
  const isEditing = Boolean(initialExpense);

  const [formData, setFormData] = useState<ExpenseFormData>(() => ({
    title: initialExpense?.title || "",
    category: initialExpense?.category || "Rent & Utilities",
    amount: initialExpense ? String(initialExpense.amount) : "",
    date: initialExpense?.date || new Date().toISOString().split("T")[0],
    paymentMethod: initialExpense?.paymentMethod || "Bank Transfer",
  }));

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;
    const errors = validateExpenseForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const expenseRecord: Expense = {
      id: initialExpense?.id || "",
      title: formData.title.trim(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
    };

    savingRef.current = true;
    setIsSaving(true);
    try {
      if (await onSave(expenseRecord)) onClose();
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      title={isEditing ? "Edit Expense Record" : "Record Store Expense"}
      subtitle="Manage store operating expenses, utilities, payroll, and logistics payouts"
      size="md"
      submitText={
        isSaving
          ? "Saving..."
          : isEditing
            ? "Update Expense"
            : "Save Expense Voucher"
      }
    >
      <FormGroup>
        <FormLabel>Expense Title *</FormLabel>
        <FormInput
          type="text"
          placeholder="e.g. Multiplan Shop Rent, Staff Salaries, Electricity..."
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        {formErrors.title && <FormError>{formErrors.title}</FormError>}
      </FormGroup>

      <FormRow>
        <FormGroup>
          <FormLabel>Expense Category *</FormLabel>
          <CustomSelect
            fullWidth
            value={formData.category}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                category: val as ExpenseCategory,
              }))
            }
            options={EXPENSE_CATEGORIES.filter((c) => c !== "All").map(
              (c) => ({
                value: c,
                label: c,
              }),
            )}
          />
          {formErrors.category && <FormError>{formErrors.category}</FormError>}
        </FormGroup>

        <FormGroup>
          <FormLabel>Expense Amount (৳) *</FormLabel>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
          />
          {formErrors.amount && <FormError>{formErrors.amount}</FormError>}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <FormLabel>Date *</FormLabel>
          <FormInput
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          {formErrors.date && <FormError>{formErrors.date}</FormError>}
        </FormGroup>

        <FormGroup>
          <FormLabel>Payment Method *</FormLabel>
          <CustomSelect
            fullWidth
            value={formData.paymentMethod}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                paymentMethod: val as AccountsPaymentMethod,
              }))
            }
            options={ACCOUNTS_PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
          />
          {formErrors.paymentMethod && (
            <FormError>{formErrors.paymentMethod}</FormError>
          )}
        </FormGroup>
      </FormRow>

    </ModalForm>
  );
};

