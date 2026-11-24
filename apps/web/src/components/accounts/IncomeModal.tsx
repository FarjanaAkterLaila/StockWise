import React, { useState } from "react";
import type { Income, IncomeSource, PaymentMethod } from "@/types";
import { INCOME_SOURCES, PAYMENT_METHODS } from "@/utils/constants";
import { generateIncomeReference } from "@/utils/accounts.utils";
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

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: Income) => void;
}

const getInitialIncomeFormData = () => ({
  source: "PC Assembly Service" as IncomeSource,
  referenceNumber: generateIncomeReference(),
  date: new Date().toISOString().split("T")[0],
  amount: "",
  paymentMethod: "Cash" as PaymentMethod,
  payerName: "",
  description: "",
});

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState(getInitialIncomeFormData);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.source) errors.source = "Income source is required";
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0)
      errors.amount = "Valid amount is required (greater than 0)";
    if (!formData.date.trim()) errors.date = "Date is required";
    if (!formData.payerName.trim())
      errors.payerName = "Payer or customer name is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      source: formData.source,
      referenceNumber:
        formData.referenceNumber || generateIncomeReference(),
      date: formData.date,
      amount: amt,
      paymentMethod: formData.paymentMethod,
      payerName: formData.payerName.trim(),
      description:
        formData.description.trim() || `${formData.source} revenue collected`,
    };

    onSave(newIncome);
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Record Revenue & Service Income"
      subtitle="Log custom PC assembly fees, component repairs, or corporate contract inflows"
      size="md"
      submitText="Save Income Entry"
    >
      <FormRow>
        <FormGroup>
          <FormLabel>Income Source *</FormLabel>
          <CustomSelect
            fullWidth
            value={formData.source}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                source: val as IncomeSource,
              }))
            }
            options={INCOME_SOURCES.filter((s) => s !== "All").map((s) => ({
              value: s,
              label: s,
            }))}
          />
          {formErrors.source && <FormError>{formErrors.source}</FormError>}
        </FormGroup>

        <FormGroup>
          <FormLabel>Income Amount (৳) *</FormLabel>
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
          <FormLabel>Payer / Client Name *</FormLabel>
          <FormInput
            type="text"
            placeholder="Customer or Organization Name..."
            value={formData.payerName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, payerName: e.target.value }))
            }
          />
          {formErrors.payerName && (
            <FormError>{formErrors.payerName}</FormError>
          )}
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
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <FormLabel>Transaction Date *</FormLabel>
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
          <FormLabel>Reference Number</FormLabel>
          <FormInput
            type="text"
            placeholder="e.g. INC-SRV-045"
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
        <FormLabel>Description / Work Details</FormLabel>
        <FormTextarea
          rows={3}
          placeholder="Details about hardware assembled, serviced, or contracts fulfilled..."
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </FormGroup>
    </ModalForm>
  );
};

