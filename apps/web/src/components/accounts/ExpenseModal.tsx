import React, { useState } from "react";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/types";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/utils/constants";
import { generateExpenseReference } from "@/utils/accounts.utils";
import { validateExpenseForm, type ExpenseFormData } from "@/validations/expense.validation";
import { ModalForm } from "@/components/common/ModalForm";
import { CustomSelect } from "@/components/common/CustomSelect";
import {
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormError,
} from "./Accounts.styles";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
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
    description: initialExpense?.description || "",
    recipient: initialExpense?.recipient || "",
    referenceNumber:
      initialExpense?.referenceNumber || generateExpenseReference(),
  }));

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateExpenseForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const expenseRecord: Expense = {
      id: initialExpense ? initialExpense.id : `exp-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      description: formData.description.trim(),
      recipient: formData.recipient?.trim() || "Store Operational Expense",
      referenceNumber:
        formData.referenceNumber || generateExpenseReference(),
    };

    onSave(expenseRecord);
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit Expense Record" : "Record Store Expense"}
      subtitle="Manage store operating expenses, utilities, payroll, and logistics payouts"
      size="md"
      submitText={isEditing ? "Update Expense" : "Save Expense Voucher"}
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
                paymentMethod: val as PaymentMethod,
              }))
            }
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
          />
          {formErrors.paymentMethod && (
            <FormError>{formErrors.paymentMethod}</FormError>
          )}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <FormLabel>Paid To / Recipient</FormLabel>
          <FormInput
            type="text"
            placeholder="e.g. DESCO, Landlord, Steadfast Courier, Staff..."
            value={formData.recipient}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, recipient: e.target.value }))
            }
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Reference / Voucher Number</FormLabel>
          <FormInput
            type="text"
            placeholder="e.g. EXP-2026-0120"
            value={formData.referenceNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                referenceNumber: e.target.value,
              }))
            }
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <FormLabel>Description / Expense Purpose</FormLabel>
        <FormTextarea
          rows={3}
          placeholder="Provide context or notes regarding this store expenditure..."
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </FormGroup>
    </ModalForm>
  );
};

