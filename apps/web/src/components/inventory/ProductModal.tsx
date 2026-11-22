import React, { useState } from 'react';
import type { Product } from '@/types';
import { HARDWARE_CATEGORIES, UNIT_OPTIONS, APP_STRINGS } from '@/utils/constants';
import { validateProductForm, type ProductFormData } from '@/validations/product.validation';
import { GenericModal } from '@/components/common/GenericModal';
import {
  ModalForm,
  FormGroup,
  FormRow,
  FormLabel,
  FormInput,
  FormSelect,
  FormError,
  ModalFooter,
  CancelButton,
  SubmitButton,
} from './Inventory.styles';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  initialProduct?: Product | null;
}

const AVAILABLE_CATEGORIES = HARDWARE_CATEGORIES.filter((c) => c !== 'All');

const getInitialFormData = (p: Product | null | undefined): ProductFormData => ({
  name: p?.name || '',
  sku: p?.sku || '',
  barcode: p?.barcode || '',
  category: p?.category || AVAILABLE_CATEGORIES[0] || 'Graphics Cards',
  costPrice: p ? String(p.costPrice) : '',
  sellingPrice: p ? String(p.sellingPrice) : '',
  stockQuantity: p ? String(p.stockQuantity) : '',
  minStockLevel: p ? String(p.minStockLevel) : '5',
  unit: p?.unit || 'pcs',
  status: p?.status || 'active',
});

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const isEditing = Boolean(initialProduct);
  const [formData, setFormData] = useState<ProductFormData>(() => getInitialFormData(initialProduct));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...(initialProduct ? { id: initialProduct.id } : {}),
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      barcode: formData.barcode?.trim() || undefined,
      category: formData.category,
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      minStockLevel: parseInt(formData.minStockLevel, 10),
      unit: formData.unit,
      status: formData.status,
    });
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEditing ? 'Edit Product' : 'Add New Hardware Product'}
      subtitle={
        isEditing
          ? `Updating specifications for ${initialProduct?.sku}`
          : 'Enter computer shop hardware specifications and inventory details'
      }
    >
      <ModalForm onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel htmlFor="prod-name">Product Name <span className="required">*</span></FormLabel>
          <FormInput
            id="prod-name"
            type="text"
            placeholder="e.g. NVIDIA GeForce RTX 4080 Super 16GB"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <FormError>{errors.name}</FormError>}
        </FormGroup>

        <FormRow>
          <FormGroup>
            <FormLabel htmlFor="prod-sku">SKU / Item Code <span className="required">*</span></FormLabel>
            <FormInput
              id="prod-sku"
              type="text"
              placeholder="e.g. GPU-NV-4080S"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
            {errors.sku && <FormError>{errors.sku}</FormError>}
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="prod-barcode">Barcode / EAN (Optional)</FormLabel>
            <FormInput
              id="prod-barcode"
              type="text"
              placeholder="e.g. 843591029101"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <FormLabel htmlFor="prod-cat">Category <span className="required">*</span></FormLabel>
            <FormSelect
              id="prod-cat"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {AVAILABLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="prod-unit">Unit of Measure</FormLabel>
            <FormSelect
              id="prod-unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </FormSelect>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <FormLabel htmlFor="prod-cost">Purchase Price ($) <span className="required">*</span></FormLabel>
            <FormInput
              id="prod-cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            />
            {errors.costPrice && <FormError>{errors.costPrice}</FormError>}
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="prod-sell">Selling Price ($) <span className="required">*</span></FormLabel>
            <FormInput
              id="prod-sell"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            />
            {errors.sellingPrice && <FormError>{errors.sellingPrice}</FormError>}
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <FormLabel htmlFor="prod-stock">Initial Stock Quantity</FormLabel>
            <FormInput
              id="prod-stock"
              type="number"
              min="0"
              placeholder="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            />
            {errors.stockQuantity && <FormError>{errors.stockQuantity}</FormError>}
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="prod-min">Low Stock Warning Threshold</FormLabel>
            <FormInput
              id="prod-min"
              type="number"
              min="0"
              placeholder="5"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
            />
            {errors.minStockLevel && <FormError>{errors.minStockLevel}</FormError>}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <FormLabel htmlFor="prod-status">Catalog Status</FormLabel>
          <FormSelect
            id="prod-status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
          >
            <option value="active">Active (Available for POS & Sales)</option>
            <option value="inactive">Inactive (Discontinued / Hidden)</option>
          </FormSelect>
        </FormGroup>

        <ModalFooter>
          <CancelButton type="button" onClick={onClose}>
            {APP_STRINGS.cancel}
          </CancelButton>
          <SubmitButton type="submit">
            {isEditing ? APP_STRINGS.saveChanges : APP_STRINGS.createProduct}
          </SubmitButton>
        </ModalFooter>
      </ModalForm>
    </GenericModal>
  );
};
