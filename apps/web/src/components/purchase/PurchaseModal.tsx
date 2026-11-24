import { useState, useMemo, useEffect } from "react";
import type {
  Purchase,
  PaymentMethod,
  PurchaseStatus,
  Supplier,
  Product,
} from "@/types";
import { fetchSuppliers } from "@/services/suppliers.service";
import { fetchProducts } from "@/services/products.service";
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
  onSave: (purchaseData: Omit<Purchase, "id"> & { id?: string; newPaymentAmount?: number }) => void;
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<PurchaseFormData>(() =>
    getInitialPurchaseFormData(initialPurchase),
  );
  const [newPaymentAmount, setNewPaymentAmount] = useState("0");
  const [isCustomSupplier, setIsCustomSupplier] = useState<boolean>(() =>
    Boolean(!initialPurchase?.supplierId && initialPurchase?.supplierName),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchSuppliers().catch(() => []),
      fetchProducts().catch(() => []),
    ]).then(([supps, prods]) => {
      if (isMounted) {
        setSuppliers(supps);
        setProducts(prods);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const calculations = useMemo(() => {
    return calculatePurchaseTotals(
      formData.items,
      formData.discountAmount,
      formData.vatRate,
      isEditing
        ? String((initialPurchase?.paidAmount || 0) + (Number(newPaymentAmount) || 0))
        : formData.paidAmount,
    );
  }, [
    formData.items,
    formData.discountAmount,
    formData.vatRate,
    formData.paidAmount,
    isEditing,
    initialPurchase?.paidAmount,
    newPaymentAmount,
  ]);

  const supplierOptions = useMemo(() => {
    const list = suppliers
      .filter((s) => {
        const lower = (s.name || "").toLowerCase();
        return (
          !lower.includes("authorized hardware distributor") &&
          !lower.includes("authorized distributor")
        );
      })
      .map((s) => ({
        value: s.id,
        label:
          s.contactPerson && s.contactPerson !== s.name
            ? `${s.name} (${s.contactPerson})`
            : s.name,
      }));

    // Ensure selected supplier is NEVER omitted or rendered as blank
    if (
      formData.supplierId &&
      formData.supplierId !== "__add_new_supplier__" &&
      !list.some((opt) => opt.value === formData.supplierId)
    ) {
      const existingInRaw = suppliers.find((s) => s.id === formData.supplierId);
      list.unshift({
        value: formData.supplierId,
        label: existingInRaw
          ? existingInRaw.name
          : formData.supplierName || "Selected Supplier",
      });
    }

    // Include "+ Add New Supplier" option directly within the dropdown
    list.push({
      value: "__add_new_supplier__",
      label: "+ Add New Supplier",
    });

    return list;
  }, [suppliers, formData.supplierId, formData.supplierName]);

  const productOptions = useMemo(() => {
    const list = products.map((p) => ({
      value: p.id,
      label: `${p.name} [${p.sku || "No SKU"}] - Cost: ৳${p.costPrice.toLocaleString()}`,
    }));

    // Inject any items in current purchase whose products haven't loaded or are archived
    for (const item of formData.items) {
      if (item.productId && !list.some((p) => p.value === item.productId)) {
        list.push({
          value: item.productId,
          label: `${item.productName || "Hardware Item"} [${item.sku || "Component"}] - Cost: ৳${Number(item.unitPrice || 0).toLocaleString()}`,
        });
      }
    }

    return list;
  }, [products, formData.items]);

  const handleSupplierSelect = (supplierId: string) => {
    if (supplierId === "__add_new_supplier__") {
      setIsCustomSupplier(true);
      setFormData((prev) => ({
        ...prev,
        supplierId: "",
        supplierName: "",
      }));
      return;
    }
    const found = suppliers.find((s) => s.id === supplierId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        supplierId: found.id,
        supplierName: found.name,
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.supplier;
        return next;
      });
    }
  };

  const handleSupplierNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      supplierName: name,
      supplierId:
        suppliers.find((s) => s.name.toLowerCase() === name.trim().toLowerCase())
          ?.id || "",
    }));
    if (name.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.supplier;
        return next;
      });
    }
  };

  const handleItemProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
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
    const enteredPayment = isEditing
      ? (newPaymentAmount.trim() === "" ? 0 : Number(newPaymentAmount))
      : Number(formData.paidAmount) || 0;
    if (!Number.isFinite(enteredPayment) || enteredPayment < 0) {
      validationErrors.paidAmount = "Payment must be a valid non-negative amount";
    }
    if (isEditing && enteredPayment > Math.max(0, calculations.grandTotal - (initialPurchase?.paidAmount || 0))) {
      validationErrors.paidAmount = "New payment cannot exceed the remaining due";
    }
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

    const purchasePayload: Omit<Purchase, "id"> & { id?: string; newPaymentAmount?: number } = {
      ...(initialPurchase?.id ? { id: initialPurchase.id } : {}),
      purchaseNumber: formData.purchaseNumber,
      supplierId: formData.supplierId,
      supplierName:
        formData.supplierName.trim() ||
        suppliers.find((s) => s.id === formData.supplierId)?.name ||
        "",
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
      newPaymentAmount: isEditing ? enteredPayment : undefined,
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
            placeholder="e.g. PO-20261124-1001"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                purchaseNumber: e.target.value,
              }))
            }
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

      {supplierOptions.length > 0 && !isCustomSupplier ? (
        <FormRow $cols="1fr">
          <FormGroup>
            <FormLabel>Distributor / Supplier *</FormLabel>
            <CustomSelect
              fullWidth
              options={supplierOptions}
              value={formData.supplierId}
              onChange={handleSupplierSelect}
              placeholder="Select supplier (or + Add New Supplier)"
              ariaLabel="Select hardware supplier"
            />
            {errors.supplier && <FormError>{errors.supplier}</FormError>}
          </FormGroup>
        </FormRow>
      ) : (
        <FormRow $cols="1fr">
          <FormGroup>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <FormLabel style={{ marginBottom: 0 }}>
                New Distributor / Supplier Name *
              </FormLabel>
              {supplierOptions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomSupplier(false);
                    const defaultSupp = supplierOptions.find(
                      (s) => s.value !== "__add_new_supplier__",
                    );
                    if (defaultSupp) {
                      handleSupplierSelect(defaultSupp.value);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4f46e5",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ← Back to Supplier Dropdown
                </button>
              )}
            </div>
            <FormInput
              type="text"
              value={formData.supplierName}
              placeholder="Enter Supplier or Distributor Name (e.g. Smart Technologies BD, UCC, Ryans...)"
              onChange={(e) => handleSupplierNameChange(e.target.value)}
              autoFocus
            />
            {errors.supplier && <FormError>{errors.supplier}</FormError>}
          </FormGroup>
        </FormRow>
      )}

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
                  step="0.01"
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

      <FormRow $cols="1.2fr 1.8fr">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <FormGroup>
            <FormLabel>Payment Method</FormLabel>
            <CustomSelect
              fullWidth
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
              fullWidth
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <FormLabel style={{ margin: 0 }}>{isEditing ? "New Payment (BDT ৳)" : "Paid Amount (BDT ৳)"}</FormLabel>
              {!isEditing && calculations.grandTotal > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      paidAmount: String(calculations.grandTotal),
                    }))
                  }
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--color-primary, #6366f1)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                  title="Set paid amount to full grand total"
                >
                  Pay Full ({formatCurrency(calculations.grandTotal)})
                </button>
              )}
            </div>
            <FormInput
              type="number"
              min="0"
              step="0.01"
              value={isEditing ? newPaymentAmount : formData.paidAmount}
              max={isEditing ? Math.max(0, calculations.grandTotal - (initialPurchase?.paidAmount || 0)) : calculations.grandTotal}
              onChange={(e) => isEditing
                ? setNewPaymentAmount(e.target.value)
                :
                setFormData((prev) => ({
                  ...prev,
                  paidAmount: e.target.value,
                }))
              }
            />
            {errors.paidAmount && <FormError>{errors.paidAmount}</FormError>}
          </FormGroup>
        </div>

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
                step="0.01"
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
            <span>{isEditing ? "Previously Paid:" : "Amount Paid:"}</span>
            <span>{formatCurrency(isEditing ? initialPurchase?.paidAmount || 0 : calculations.paidAmount)}</span>
          </TotalsRow>

          {isEditing && <TotalsRow>
            <span>Total Paid After This Payment:</span>
            <span>{formatCurrency(calculations.paidAmount)}</span>
          </TotalsRow>}

          <TotalsRow>
            <span>Outstanding Due:</span>
            <TotalsAmount $danger={calculations.dueAmount > 0}>
              {formatCurrency(calculations.dueAmount)}
            </TotalsAmount>
          </TotalsRow>
        </TotalsCard>
      </FormRow>

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
