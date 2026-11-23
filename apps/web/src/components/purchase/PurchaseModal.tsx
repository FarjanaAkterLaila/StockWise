import { useState, useMemo } from "react";
import type { Purchase, PaymentMethod, PurchaseStatus } from "@/types";
import { INITIAL_PRODUCTS, MOCK_SUPPLIERS } from "@/data/mockData";
import { PAYMENT_METHODS, APP_STRINGS } from "@/utils/constants";
import {
  validatePurchaseForm,
  type PurchaseFormData,
} from "@/validations/purchase.validation";
import {
  getInitialPurchaseFormData,
  calculatePurchaseTotals,
  determinePurchasePaymentStatus,
  createInitialPurchaseItem,
  PURCHASE_ITEM_FIELDS,
  type PurchaseItemField,
} from "@/utils/purchase.utils";
import { ModalForm } from "@/components/common/ModalForm";
import { CustomSelect } from "@/components/common/CustomSelect";
import { formatCurrency, formatTime } from "@/utils/formatters";
import { Plus, Trash2 } from "lucide-react";
import {
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  FormTextarea,
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
  VatAmountText,
} from "./Purchase.styles";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchaseData: Omit<Purchase, "id"> & { id?: string }) => void;
  initialPurchase?: Purchase | null;
}

const PURCHASE_STATUS_MODAL_OPTIONS = [
  { value: "received", label: "Received (Stock Intake Complete)" },
  { value: "ordered", label: "Ordered (Awaiting Distributor Dispatch)" },
  { value: "pending", label: "Pending (Order Processing)" },
];

const PAYMENT_METHOD_OPTIONS = PAYMENT_METHODS.map((m) => ({
  value: m,
  label: m,
}));

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPurchase,
}) => {
  const isEditing = Boolean(initialPurchase);
  const [formData, setFormData] = useState<PurchaseFormData>(() =>
    getInitialPurchaseFormData(initialPurchase),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculations = useMemo(() => {
    return calculatePurchaseTotals(
      formData.items,
      formData.discountAmount,
      formData.vatRate,
      formData.paidAmount,
    );
  }, [
    formData.items,
    formData.discountAmount,
    formData.vatRate,
    formData.paidAmount,
  ]);

  const supplierOptions = MOCK_SUPPLIERS.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.distributorOf.slice(0, 2).join(", ")})`,
  }));

  const productOptions = INITIAL_PRODUCTS.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.sku}] - Default Cost: ৳${p.costPrice.toLocaleString()}`,
  }));

  const handleSupplierSelect = (supplierId: string) => {
    const found = MOCK_SUPPLIERS.find((s) => s.id === supplierId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        supplierId: found.id,
        supplierName: found.name,
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
      unitPrice: String(prod.costPrice),
    };
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleItemFieldChange = (
    index: number,
    field: PurchaseItemField,
    value: string,
  ) => {
    const updated = [...formData.items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createInitialPurchaseItem()],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePurchaseForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const {
      subtotal,
      discount,
      vatRate,
      vatAmount,
      grandTotal,
      paidAmount,
      dueAmount,
    } = calculations;

    const paymentStatus = determinePurchasePaymentStatus(
      paidAmount,
      grandTotal,
    );

    const purchasePayload: Omit<Purchase, "id"> & { id?: string } = {
      ...(initialPurchase?.id ? { id: initialPurchase.id } : {}),
      purchaseNumber: formData.purchaseNumber,
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      date: formData.date,
      time: initialPurchase?.time || formatTime(),
      items: formData.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        quantity: parseInt(i.quantity, 10) || 1,
        unitPrice: parseFloat(i.unitPrice) || 0,
        subtotal:
          (parseInt(i.quantity, 10) || 1) * (parseFloat(i.unitPrice) || 0),
      })),
      subtotal,
      discountAmount: discount,
      vatRate,
      vatAmount,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      notes: formData.notes,
    };

    onSave(purchasePayload);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        isEditing ? "Edit Purchase Order" : "New Purchase Order (Stock Intake)"
      }
      subtitle={
        isEditing
          ? "Update distributor order specifications and intake quantities"
          : "Procurement purchase order and inventory intake specification"
      }
      onSubmit={handleSubmit}
      submitText={
        isEditing ? APP_STRINGS.savePurchase : APP_STRINGS.createPurchase
      }
      cancelText={APP_STRINGS.cancel}
    >
      <FormRow>
        <FormGroup>
          <FormLabel>PO Number</FormLabel>
          <FormInput
            type="text"
            value={formData.purchaseNumber}
            disabled
            readOnly
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Purchase Date *</FormLabel>
          <FormInput
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          {errors.date && <FormError>{errors.date}</FormError>}
        </FormGroup>
      </FormRow>

      {/* Supplier / Distributor Selection */}
      <FormRow $cols="1fr">
        <FormGroup>
          <FormLabel>Distributor / Supplier *</FormLabel>
          <CustomSelect
            options={supplierOptions}
            value={formData.supplierId}
            onChange={handleSupplierSelect}
            placeholder="Select Authorized Hardware Distributor"
            ariaLabel="Select hardware supplier"
          />
          {errors.supplier && <FormError>{errors.supplier}</FormError>}
        </FormGroup>
      </FormRow>

      {/* Product Line Items */}
      <ItemLinesSection>
        <ItemLinesHeader>
          <ItemLinesTitle>
            Component Line Items ({formData.items.length})
          </ItemLinesTitle>
          <AddItemBtn type="button" onClick={handleAddItem}>
            <Plus size={14} />
            <span>Add Hardware Component</span>
          </AddItemBtn>
        </ItemLinesHeader>

        {errors.items && <FormError>{errors.items}</FormError>}

        <ItemLineHeaderRow>
          <span>Hardware Component</span>
          <span>Quantity</span>
          <span>Unit Cost (৳)</span>
          <span>Line Total (৳)</span>
          <span />
        </ItemLineHeaderRow>

        {formData.items.map((item, idx) => {
          const lineSubtotal =
            (parseInt(item.quantity, 10) || 0) *
            (parseFloat(item.unitPrice) || 0);

          return (
            <ItemLineRow key={item.id}>
              <div>
                <CustomSelect
                  fullWidth
                  options={productOptions}
                  value={item.productId}
                  onChange={(val) => handleItemProductChange(idx, val)}
                  placeholder="Select Component"
                  ariaLabel={`Select product for line item ${idx + 1}`}
                />
                {errors[`item_${idx}_product`] && (
                  <FormError>{errors[`item_${idx}_product`]}</FormError>
                )}
              </div>

              <div>
                <FormInput
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemFieldChange(
                      idx,
                      PURCHASE_ITEM_FIELDS.QUANTITY,
                      e.target.value,
                    )
                  }
                />
                {errors[`item_${idx}_qty`] && (
                  <FormError>{errors[`item_${idx}_qty`]}</FormError>
                )}
              </div>

              <div>
                <FormInput
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Unit Cost"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemFieldChange(
                      idx,
                      PURCHASE_ITEM_FIELDS.UNIT_PRICE,
                      e.target.value,
                    )
                  }
                />
                {errors[`item_${idx}_price`] && (
                  <FormError>{errors[`item_${idx}_price`]}</FormError>
                )}
              </div>

              <ItemLineTotal>{formatCurrency(lineSubtotal)}</ItemLineTotal>

              <RemoveItemBtn
                type="button"
                onClick={() => handleRemoveItem(idx)}
                disabled={formData.items.length <= 1}
                title="Remove Item"
              >
                <Trash2 size={15} />
              </RemoveItemBtn>
            </ItemLineRow>
          );
        })}
      </ItemLinesSection>

      {/* Summary Calculations & Discount / VAT */}
      <FormRow $cols="1.2fr 1.8fr">
        {/* Left Column: Settlement & Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <FormGroup>
            <FormLabel>Payment Method</FormLabel>
            <CustomSelect
              options={PAYMENT_METHOD_OPTIONS}
              value={formData.paymentMethod}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: val as PaymentMethod,
                }))
              }
              ariaLabel="Select payment method"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Purchase Order Status</FormLabel>
            <CustomSelect
              options={PURCHASE_STATUS_MODAL_OPTIONS}
              value={formData.status}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  status: val as PurchaseStatus,
                }))
              }
              ariaLabel="Select purchase status"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Paid Amount (BDT ৳)</FormLabel>
            <FormInput
              type="number"
              min="0"
              step="100"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paidAmount: e.target.value,
                }))
              }
            />
            {errors.paidAmount && <FormError>{errors.paidAmount}</FormError>}
          </FormGroup>
        </div>

        {/* Right Column: Calculations Card */}
        <TotalsCard>
          <TotalsRow>
            <span>Items Subtotal:</span>
            <TotalsAmount>{formatCurrency(calculations.subtotal)}</TotalsAmount>
          </TotalsRow>

          <TotalsRow>
            <span>Supplier Discount (৳):</span>
            <div style={{ width: "120px" }}>
              <FormInput
                type="number"
                min="0"
                step="100"
                value={formData.discountAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountAmount: e.target.value,
                  }))
                }
              />
            </div>
          </TotalsRow>

          <TotalsRow>
            <span>VAT Rate (%):</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
                width: "120px",
              }}
            >
              <FormInput
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.vatRate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vatRate: e.target.value,
                  }))
                }
              />
              <VatAmountText>
                (+ {formatCurrency(calculations.vatAmount)})
              </VatAmountText>
            </div>
          </TotalsRow>

          <TotalsRow $isGrandTotal={true}>
            <span>Grand Total:</span>
            <TotalsAmount $highlight={true}>
              {formatCurrency(calculations.grandTotal)}
            </TotalsAmount>
          </TotalsRow>

          <TotalsRow>
            <span>Amount Paid:</span>
            <span>{formatCurrency(calculations.paidAmount)}</span>
          </TotalsRow>

          <TotalsRow>
            <span>Outstanding Due:</span>
            <TotalsAmount $danger={calculations.dueAmount > 0}>
              {formatCurrency(calculations.dueAmount)}
            </TotalsAmount>
          </TotalsRow>
        </TotalsCard>
      </FormRow>

      {/* Notes */}
      <FormGroup>
        <FormLabel>Order Remarks / Warranty Tracking Notes</FormLabel>
        <FormTextarea
          placeholder="Add distributor batch serial, shipping carrier tracking, or warranty terms..."
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
      </FormGroup>
    </ModalForm>
  );
};
