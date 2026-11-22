import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
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
} from './GenericModal.styles';

export interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
  cancelText = 'Cancel',
  onConfirm,
  variant = 'primary',
  size = 'md',
  showCloseButton = true,
  children,
  footer,
}: GenericModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showDefaultFooter = Boolean(onConfirm || confirmText);

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Dialog $size={size} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <Header>
            <HeaderLeft>
              {title && <Title>{title}</Title>}
              {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </HeaderLeft>
            {showCloseButton && (
              <CloseButton onClick={onClose} type="button" aria-label="Close modal">
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
};
