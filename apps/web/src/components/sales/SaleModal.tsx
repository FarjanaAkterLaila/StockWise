import { useState, useMemo, useEffect, useRef } from "react";
import type { Sale, PaymentMethod, Customer, Product, CustomerType } from "@/types";
import { fetchCustomers } from "@/services/customers.service";
import { fetchProducts } from "@/services/products.service";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/utils/permissions";
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
} from "./Sales.styles";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Omit<Sale, "id"> & {
    id?: string;
    newPaymentAmount?: number;
    paymentDate?: string;
    paymentReferenceNumber?: string;
  }) => void;
  initialSale?: Sale | null;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSale,
}) => {
  const { user } = useAuth();
  const canCreateCustomer = hasPermission(user?.role, "customers", "create");
  const isEditing = Boolean(initialSale);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [formData, setFormData] = useState<SaleFormData>(() =>
    getInitialSaleFormData(initialSale),
  );
  const [newPaymentAmount, setNewPaymentAmount] = useState("0");
  const [paymentDate, setPaymentDate] = useState(() => initialSale?.paymentDate || "");
  const paymentReferenceNumber = useRef<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchProducts().catch(() => []),
      fetchCustomers().catch(() => []),
    ]).then(([prods, custs]) => {
      if (isMounted) {
        setProducts(prods);
        setCustomers(custs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const customerOptions = useMemo(() => {
    const list = [
      {
        value: "",
        label: "Walk-in Customer (Cash / Retail)",
      },
      ...(canCreateCustomer
        ? [
          {
            value: "__add_new_customer__",
            label: "➕ Add New Customer (Create Profile)",
          },
        ]
        : []),
      ...customers.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.phone && c.phone !== "N/A" ? c.phone : c.customerType})`,
      })),
    ];

    if (
      formData.customerId &&
      formData.customerId !== "cust-walkin" &&
      !list.some((opt) => opt.value === formData.customerId)
    ) {
      const existingInRaw = customers.find((c) => c.id === formData.customerId);
      list.push({
        value: formData.customerId,
        label: existingInRaw
          ? existingInRaw.name
          : `${formData.customerName || "Customer"} (${formData.customerPhone || "Profile"})`,
      });
    }

    return list;
  }, [
    customers,
    formData.customerId,
    formData.customerName,
    formData.customerPhone,
    canCreateCustomer,
  ]);

  const productOptions = useMemo(() => {
    const list = products.map((p) => ({
      value: p.id,
      label: `${p.name} [${p.sku || "No SKU"}] (Stock: ${p.stockQuantity}) - ৳${p.sellingPrice.toLocaleString()}`,
    }));

    // Ensure all items in the invoice are present in the options list so names display
    for (const item of formData.items) {
      if (item.productId && !list.some((p) => p.value === item.productId)) {
        list.push({
          value: item.productId,
          label: `${item.productName || "Hardware Product"} [${item.sku || "Item"}] - ৳${Number(item.unitPrice || 0).toLocaleString()}`,
        });
      }
    }

    return list;
  }, [products, formData.items]);

  const calculations = useMemo(() => {
    return calculateSaleTotals(
      formData.items,
      formData.discountAmount,
      formData.taxAmount,
      isEditing
        ? String((Number(initialSale?.paidAmount) || 0) + (Number(newPaymentAmount) || 0))
        : formData.paidAmount,
    );
  }, [
    formData.items,
    formData.discountAmount,
    formData.taxAmount,
    formData.paidAmount,
    isEditing,
    initialSale?.paidAmount,
    newPaymentAmount,
  ]);

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "__add_new_customer__") {
      setIsAddingNewCustomer(true);
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName:
          prev.customerName === "Walk-in Customer" ? "" : prev.customerName,
        customerType: "Retail",
        customerPhone: "",
      }));
      return;
    }

    setIsAddingNewCustomer(false);

    if (!customerId || customerId === "cust-walkin") {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName:
          prev.customerName && prev.customerName !== "Walk-in Customer"
            ? prev.customerName
            : "Walk-in Customer",
        customerType: "Retail",
        customerPhone: "",
      }));
      return;
    }
    const found = customers.find((c) => c.id === customerId);
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
    const prod = products.find((p) => p.id === productId);
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
    const additionalPayment = isEditing
      ? (newPaymentAmount.trim() ? Number(newPaymentAmount) : 0)
      : 0;
    const remainingDue = Math.max(
      0,
      calculations.totalAmount - (Number(initialSale?.paidAmount) || 0),
    );
    if (isEditing && (!Number.isFinite(additionalPayment) || additionalPayment < 0)) {
      valErrors.paidAmount = "New payment must be a valid non-negative amount";
    } else if (isEditing && additionalPayment > remainingDue) {
      valErrors.paidAmount = "New payment cannot exceed the remaining due";
    }
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    if (isEditing && additionalPayment > 0 && !paymentReferenceNumber.current) {
      paymentReferenceNumber.current = `PAY-SAL-${crypto.randomUUID()}`;
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
      newPaymentAmount: isEditing ? additionalPayment : undefined,
      paymentDate: isEditing ? paymentDate : undefined,
      paymentReferenceNumber: isEditing ? (paymentReferenceNumber.current || undefined) : undefined,
      dueAmount,
      paymentStatus,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      notes: formData.notes?.trim() || undefined,
    });
  };

  return (
    <ModalForm
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
      onSubmit={handleSubmit}
      submitText={isEditing ? APP_STRINGS.saveSale : APP_STRINGS.createSale}
      cancelText={APP_STRINGS.cancel}
    >
      <FormRow $cols="1.2fr 1fr 1fr">
        <FormGroup>
          <FormLabel>
            Customer Profile (Select or Walk-in)
          </FormLabel>
          <CustomSelect
            fullWidth
            value={isAddingNewCustomer ? "__add_new_customer__" : (formData.customerId || "")}
            onChange={handleCustomerSelect}
            placeholder="Select customer profile..."
            options={customerOptions}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>
            {isAddingNewCustomer ? "New Customer Name" : "Customer Name"} <span className="required">*</span>
          </FormLabel>
          <FormInput
            type="text"
            placeholder={isAddingNewCustomer ? "e.g. Smart IT Solutions" : "Walk-in Customer"}
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

      {isAddingNewCustomer && (
        <FormRow $cols="1fr 1fr">
          <FormGroup>
            <FormLabel>Customer Mobile / Phone</FormLabel>
            <FormInput
              type="text"
              placeholder="e.g. 01712345678"
              value={formData.customerPhone || ""}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Customer Category</FormLabel>
            <CustomSelect
              fullWidth
              value={formData.customerType || "Retail"}
              onChange={(val) =>
                setFormData({ ...formData, customerType: val as CustomerType })
              }
              options={[
                { value: "Retail", label: "Retail (খুচরা ক্রেতা)" },
                { value: "Wholesale", label: "Wholesale (পাইকারি ক্রেতা)" },
                { value: "Corporate", label: "Corporate (প্রতিষ্ঠান / অফিস)" },
              ]}
            />
          </FormGroup>
        </FormRow>
      )}

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
                placeholder={item.productName ? `${item.productName} [${item.sku || 'Product'}]` : "Select hardware component..."}
                options={productOptions}
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

      <FormRow $cols="repeat(5, minmax(0, 1fr))">
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
            step={isEditing ? "0.01" : "1"}
            min="0"
            max={
              isEditing
                ? Math.max(
                  0,
                  calculations.totalAmount -
                  (Number(initialSale?.paidAmount) || 0),
                )
                : calculations.totalAmount
            }
            value={isEditing ? newPaymentAmount : formData.paidAmount}
            onChange={(e) =>
              isEditing
                ? setNewPaymentAmount(e.target.value)
                : setFormData({ ...formData, paidAmount: e.target.value })
            }
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Payment Date</FormLabel>
          <FormInput
            type="date"
            value={isEditing ? paymentDate : formData.date}
            onChange={(e) => {
              if (isEditing) setPaymentDate(e.target.value);
              setFormData({ ...formData, date: e.target.value });
            }}
          />
        </FormGroup>
      </FormRow>

      {isEditing && (initialSale?.lastPaymentReferenceNumber || initialSale?.lastPaymentNotes) && (
        <FormRow $cols="1fr 1fr">
          <FormGroup>
            <FormLabel>Latest Saved Payment Reference</FormLabel>
            <FormInput
              type="text"
              value={initialSale.lastPaymentReferenceNumber || "—"}
              readOnly
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Latest Saved Payment Notes</FormLabel>
            <FormInput
              type="text"
              value={initialSale.lastPaymentNotes || "—"}
              readOnly
            />
          </FormGroup>
        </FormRow>
      )}

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
        {isEditing && <TotalsRow>
          <span>Previously Paid:</span>
          <TotalsAmount $variant="success">
            {formatCurrency(initialSale?.paidAmount || 0)}
          </TotalsAmount>
        </TotalsRow>}
        {isEditing && <TotalsRow>
          <span>Total Paid After New Payment:</span>
          <TotalsAmount $variant="success">
            {formatCurrency(calculations.paidAmount)}
          </TotalsAmount>
        </TotalsRow>}
        {!isEditing && <TotalsRow>
          <span>Collected / Paid:</span>
          <TotalsAmount $variant="success">
            {formatCurrency(calculations.paidAmount)}
          </TotalsAmount>
        </TotalsRow>}
        <TotalsRow>
          <span>Balance Due:</span>
          <TotalsAmount
            $variant={calculations.dueAmount > 0 ? "danger" : "muted"}
          >
            {formatCurrency(calculations.dueAmount)}
          </TotalsAmount>
        </TotalsRow>
      </TotalsCard>
    </ModalForm>
  );
};
