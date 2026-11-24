import styled from "styled-components";

export const AuthWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  padding: 20px;
  box-sizing: border-box;
`;

export const AuthCard = styled.div`
  width: 100%;
  max-width: 440px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 36px 32px;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;

  ${({ theme }) => theme.media.mobile} {
    padding: 28px 20px;
  }
`;

export const BrandHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
`;

export const LogoBadge = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryHover}
  );
  color: ${({ theme }) => theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.btnPrimary};
  margin-bottom: 4px;
`;

export const AppTitle = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.5px;
  margin: 0;
`;

export const AppSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export const FormWrap = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const InputLabel = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const InputFieldWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 10px 14px;
  transition: all 0.15s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focusPrimary};
    background-color: ${({ theme }) => theme.colors.background};
  }

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
    flex-shrink: 0;
  }
`;

export const StyledInput = styled.input`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13.5px;
  width: 100%;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const ErrorAlert = styled.div`
  background-color: ${({ theme }) => theme.colors.dangerLight};
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  color: ${({ theme }) => theme.colors.danger};
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 12.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SuccessAlert = styled.div`
  background-color: ${({ theme }) => theme.colors.successLight};
  border: 1px solid ${({ theme }) => theme.colors.successBorder};
  color: ${({ theme }) => theme.colors.success};
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 12.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.btnPrimary};
  transition: all 0.15s ease;
  margin-top: 4px;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const AuthFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const SwitchModeBtn = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
`;

export const DemoCredentialsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 12px 14px;
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CredentialRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const RoleBadge = styled.span<{ $role: "admin" | "manager" | "staff" }>`
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radius.xs};
  background-color: ${({ $role, theme }) =>
    $role === "admin"
      ? theme.colors.primaryLight
      : $role === "manager"
        ? theme.colors.warningLight
        : theme.colors.backgroundSubtle};
  color: ${({ $role, theme }) =>
    $role === "admin"
      ? theme.colors.primary
      : $role === "manager"
        ? theme.colors.warning
        : theme.colors.textSecondary};
`;
