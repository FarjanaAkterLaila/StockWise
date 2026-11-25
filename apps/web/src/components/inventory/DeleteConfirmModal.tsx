import React from "react";
import type { Product } from "@/types";
import { GenericModal } from "@/components/common/GenericModal";
import { APP_STRINGS } from "@/utils/constants";

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
      variant="primary"
      size="sm"
      title="Archive Product?"
      message={`Archive "${product.name}" (${product.sku || "No SKU"})? It will be hidden from new Sales and Purchases while preserving all historical transaction records, and can be restored anytime from the Archived filter.`}
      confirmText="Archive Product"
      cancelText={APP_STRINGS.cancel}
      onConfirm={onConfirm}
    />
  );
};
