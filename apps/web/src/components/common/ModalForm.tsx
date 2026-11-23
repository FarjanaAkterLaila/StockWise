import React, { type FormEvent, type ReactNode } from "react";
import { GenericModal } from "./GenericModal";
import type { ModalSize } from "@/types";
import {
  ModalFormContainer,
  ModalFooter,
  CancelBtn,
  SubmitBtn,
} from "./ModalForm.styles";
import { APP_STRINGS } from "@/utils/constants";

export interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  cancelText?: string;
  submitText?: string;
  isSubmitting?: boolean;
  children: ReactNode;
}

export const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  size = "lg",
  cancelText = APP_STRINGS.cancel,
  submitText = "Save Changes",
  isSubmitting = false,
  children,
}) => {
  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      title={title}
      subtitle={subtitle}
    >
      <ModalFormContainer onSubmit={onSubmit}>
        {children}

        <ModalFooter>
          <CancelBtn type="button" onClick={onClose} disabled={isSubmitting}>
            {cancelText}
          </CancelBtn>
          <SubmitBtn type="submit" disabled={isSubmitting}>
            {submitText}
          </SubmitBtn>
        </ModalFooter>
      </ModalFormContainer>
    </GenericModal>
  );
};
