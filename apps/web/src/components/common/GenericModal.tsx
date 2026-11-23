import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ModalVariant, ModalSize } from "@/types";
import {
  KEYBOARD_KEYS,
  DOM_EVENTS,
  MODAL_VARIANTS,
  UI_SIZES,
} from "@/utils/constants";
import {
  Overlay,
  Dialog,
  Header,
  HeaderLeft,
  Title,
  Subtitle,
  CloseButton,
  Body,
  Message,
  Footer,
  ConfirmBtn,
  CancelBtn,
} from "./GenericModal.styles";

export interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: ModalVariant;
  size?: ModalSize;
  showCloseButton?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}

export const GenericModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  message,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  variant = MODAL_VARIANTS.PRIMARY,
  size = UI_SIZES.MD,
  showCloseButton = true,
  children,
  footer,
}: GenericModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE) onClose();
    };
    window.addEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
    return () => window.removeEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showDefaultFooter = Boolean(onConfirm || confirmText);

  const modalContent = (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Dialog $size={size} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <Header>
            <HeaderLeft>
              {title && <Title>{title}</Title>}
              {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </HeaderLeft>
            {showCloseButton && (
              <CloseButton
                onClick={onClose}
                type="button"
                aria-label="Close modal"
              >
                <X size={18} />
              </CloseButton>
            )}
          </Header>
        )}

        <Body>
          {message && <Message>{message}</Message>}
          {children}
        </Body>

        {footer ? (
          footer
        ) : showDefaultFooter ? (
          <Footer>
            <CancelBtn onClick={onClose} type="button">
              {cancelText}
            </CancelBtn>
            {onConfirm && confirmText && (
              <ConfirmBtn $variant={variant} onClick={onConfirm} type="button">
                {confirmText}
              </ConfirmBtn>
            )}
          </Footer>
        ) : null}
      </Dialog>
    </Overlay>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
