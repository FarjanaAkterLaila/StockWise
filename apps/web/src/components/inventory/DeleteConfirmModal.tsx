import React from 'react';
import type { Product } from '@/types';
import { GenericModal } from '@/components/common/GenericModal';
import { APP_STRINGS } from '@/utils/constants';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
}) => {
  if (!product) return null;

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      variant="danger"
      size="sm"
      title={APP_STRINGS.deleteTitle}
      message={`Are you sure you want to remove "${product.name}" (${product.sku}) from the catalog? This action will permanently remove it from stock tracking.`}
      confirmText={APP_STRINGS.deleteConfirm}
      cancelText={APP_STRINGS.cancel}
      onConfirm={onConfirm}
    />
  );
};
