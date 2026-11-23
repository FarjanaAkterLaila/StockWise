import React, { type ReactNode } from "react";
import { GenericModal } from "./GenericModal";
import type { ModalSize } from "@/types";
import { triggerPrintModal } from "@/utils/formatters";
import { Printer } from "lucide-react";
import {
  ViewContainer,
  ModalFooter,
  PrintBtn,
  CancelBtn,
} from "./ModalForm.styles";

export interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  onPrint?: () => void;
  printLabel?: string;
  closeLabel?: string;
  children: ReactNode;
}

export const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = "lg",
  onPrint,
  printLabel = "Print",
  closeLabel = "Close",
  children,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      triggerPrintModal();
    }
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      title={title}
      subtitle={subtitle}
    >
      <ViewContainer id="printable-receipt" className="printable-receipt">
        {children}

        <ModalFooter className="no-print">
          <PrintBtn type="button" onClick={handlePrint}>
            <Printer size={15} />
            <span>{printLabel}</span>
          </PrintBtn>
          <CancelBtn type="button" onClick={onClose}>
            {closeLabel}
          </CancelBtn>
        </ModalFooter>
      </ViewContainer>
    </GenericModal>
  );
};
