import { useState, useMemo } from "react";
import type { Sale, PaymentMethod } from "@/types";
import { INITIAL_PRODUCTS, MOCK_CUSTOMERS } from "@/data/mockData";
import { PAYMENT_METHODS, APP_STRINGS } from "@/utils/constants";
import {
  validateSaleForm,
  type SaleFormData,
} from "@/validations/sale.validation";
import {
  getInitialSaleFormData,
  calculateSaleTotals,
  determinePaymentStatus,
  createInitialSaleItem,
  SALE_ITEM_FIELDS,
  type SaleItemField,
} from "@/utils/sale.utils";
import { GenericModal } from "@/components/common/GenericModal";
import { CustomSelect } from "@/components/common/CustomSelect";
import { formatCurrency, formatTime } from "@/utils/formatters";
import { Plus, Trash2 } from "lucide-react";
import {
  ModalForm,
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  ItemLinesSection,
  ItemLinesHeader,
  ItemLinesTitle,
  ItemLineHeaderRow,
  ItemLineRow,
  ItemLineTotal,
  AddItemBtn,
  RemoveItemBtn,
  TotalsCard,
  TotalsRow,
  TotalsAmount,
  ModalFooter,
  CancelBtn,
  SubmitBtn,
} from "./Sales.styles";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Omit<Sale, "id"> & { id?: string }) => void;
  initialSale?: Sale | null;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSale,
}) => {
  const isEditing = Boolean(initialSale);
  const [formData, setFormData] = useState<SaleFormData>(() =>
    getInitialSaleFormData(initialSale),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculations = useMemo(() => {
    return calculateSaleTotals(
      formData.items,
      formData.discountAmount,
      formData.taxAmount,
      formData.paidAmount,
    );
  }, [
    formData.items,
    formData.discountAmount,
    formData.taxAmount,
    formData.paidAmount,
  ]);

  const handleCustomerSelect = (customerId: string) => {
    const found = MOCK_CUSTOMERS.find((c) => c.id === customerId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customerId: found.id,
        customerName: found.name,
        customerType: found.customerType,
        customerPhone: found.phone !== "N/A" ? found.phone : "",
      }));
    }
  };

  const handleItemProductChange = (index: number, productId: string) => {
    const prod = INITIAL_PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...formData.items];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unitPrice: String(prod.sellingPrice),
    };
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleItemFieldChange = (
    index: number,
    field: SaleItemField,
    val: string,
  ) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: val };
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createInitialSaleItem()],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valErrors = validateSaleForm(formData);
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    const { subtotal, discount, tax, totalAmount, paidAmount, dueAmount } =
      calculations;
    const paymentStatus = determinePaymentStatus(paidAmount, totalAmount);

    onSave({
      ...(initialSale ? { id: initialSale.id } : {}),
      invoiceNumber: formData.invoiceNumber.trim(),
      customerId: formData.customerId,
      customerName: formData.customerName.trim(),
      customerType: formData.customerType,
      customerPhone: formData.customerPhone?.trim() || undefined,
      date: formData.date,
      time: formatTime(initialSale?.time),
      items: formData.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        quantity: parseInt(i.quantity, 10),
        unitPrice: parseFloat(i.unitPrice),
        subtotal:
          (parseInt(i.quantity, 10) || 0) * (parseFloat(i.unitPrice) || 0),
      })),
      subtotal,
      discountAmount: discount,
      taxAmount: tax,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      notes: formData.notes?.trim() || undefined,
    });
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        isEditing
          ? `Edit Sale: ${initialSale?.invoiceNumber}`
          : APP_STRINGS.createSaleBtn
      }
      subtitle={
        isEditing
          ? "Update invoice details and line items"
          : "Create a computer shop sales invoice and POS receipt (BDT)"
      }
    >
      <ModalForm onSubmit={handleSubmit}>
        <FormRow $cols="1.2fr 1fr 1fr">
          <FormGroup>
            <FormLabel>
              Customer Profile <span className="required">*</span>
            </FormLabel>
            <CustomSelect
              fullWidth
              value={formData.customerId || ""}
              onChange={handleCustomerSelect}
              placeholder="Select customer profile..."
              options={MOCK_CUSTOMERS.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.customerType})`,
              }))}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Customer Name</FormLabel>
            <FormInput
              type="text"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
            />
            {errors.customerName && (
              <FormError>{errors.customerName}</FormError>
            )}
          </FormGroup>
          <FormGroup>
            <FormLabel>Invoice Code</FormLabel>
            <FormInput
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
            />
          </FormGroup>
        </FormRow>

        <ItemLinesSection>
          <ItemLinesHeader>
            <ItemLinesTitle>
              Hardware Products ({formData.items.length})
            </ItemLinesTitle>
            <AddItemBtn onClick={handleAddItem} type="button">
              <Plus size={14} />
              <span>Add Product</span>
            </AddItemBtn>
          </ItemLinesHeader>
          {errors.items && <FormError>{errors.items}</FormError>}
          <ItemLineHeaderRow>
            <span>Product / Hardware</span>
            <span>Qty</span>
            <span>Unit Price (৳)</span>
            <span>Total (৳)</span>
            <span />
          </ItemLineHeaderRow>
          {formData.items.map((item, idx) => {
            const lineSub =
              (parseFloat(item.quantity) || 0) *
              (parseFloat(item.unitPrice) || 0);
            return (
              <ItemLineRow key={item.id}>
                <CustomSelect
                  fullWidth
                  value={item.productId}
                  onChange={(val) => handleItemProductChange(idx, val)}
                  placeholder="Select hardware component..."
                  options={INITIAL_PRODUCTS.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.sku})`,
                  }))}
                />
                <FormInput
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemFieldChange(
                      idx,
                      SALE_ITEM_FIELDS.QUANTITY,
                      e.target.value,
                    )
                  }
                />
                <FormInput
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemFieldChange(
                      idx,
                      SALE_ITEM_FIELDS.UNIT_PRICE,
                      e.target.value,
                    )
                  }
                />
                <ItemLineTotal>{formatCurrency(lineSub)}</ItemLineTotal>
                <RemoveItemBtn
                  type="button"
                  disabled={formData.items.length <= 1}
                  onClick={() => handleRemoveItem(idx)}
                  aria-label="Remove item"
                >
                  <Trash2 size={13} />
                </RemoveItemBtn>
              </ItemLineRow>
            );
          })}
        </ItemLinesSection>

        <FormRow $cols="1fr 1fr 1fr 1fr">
          <FormGroup>
            <FormLabel>Discount (৳)</FormLabel>
            <FormInput
              type="number"
              step="1"
              min="0"
              value={formData.discountAmount}
              onChange={(e) =>
                setFormData({ ...formData, discountAmount: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>VAT / Tax (৳)</FormLabel>
            <FormInput
              type="number"
              step="1"
              min="0"
              value={formData.taxAmount}
              onChange={(e) =>
                setFormData({ ...formData, taxAmount: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Payment Method</FormLabel>
            <CustomSelect
              fullWidth
              value={formData.paymentMethod}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  paymentMethod: val as PaymentMethod,
                })
              }
              options={PAYMENT_METHODS.map((m) => ({
                value: m,
                label: m,
              }))}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Paid Amount (৳)</FormLabel>
            <FormInput
              type="number"
              step="1"
              min="0"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData({ ...formData, paidAmount: e.target.value })
              }
            />
          </FormGroup>
        </FormRow>

        <TotalsCard>
          <TotalsRow>
            <span>Subtotal:</span>
            <strong>{formatCurrency(calculations.subtotal)}</strong>
          </TotalsRow>
          <TotalsRow>
            <span>Discount:</span>
            <span>-{formatCurrency(calculations.discount)}</span>
          </TotalsRow>
          <TotalsRow>
            <span>VAT:</span>
            <span>+{formatCurrency(calculations.tax)}</span>
          </TotalsRow>
          <TotalsRow $isTotal>
            <span>Net Payable (Grand Total):</span>
            <TotalsAmount $variant="primary">
              {formatCurrency(calculations.totalAmount)}
            </TotalsAmount>
          </TotalsRow>
          <TotalsRow>
            <span>Collected / Paid:</span>
            <TotalsAmount $variant="success">
              {formatCurrency(calculations.paidAmount)}
            </TotalsAmount>
          </TotalsRow>
          <TotalsRow>
            <span>Balance Due:</span>
            <TotalsAmount
              $variant={calculations.dueAmount > 0 ? "danger" : "muted"}
            >
              {formatCurrency(calculations.dueAmount)}
            </TotalsAmount>
          </TotalsRow>
        </TotalsCard>

        <ModalFooter>
          <CancelBtn type="button" onClick={onClose}>
            {APP_STRINGS.cancel}
          </CancelBtn>
          <SubmitBtn type="submit">
            {isEditing ? APP_STRINGS.saveSale : APP_STRINGS.createSale}
          </SubmitBtn>
        </ModalFooter>
      </ModalForm>
    </GenericModal>
  );
};
