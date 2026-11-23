import styled from "styled-components";

export const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const PlaceholderHero = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const PlaceholderIconWrap = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg {
    width: 28px;
    height: 28px;
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;
export const PlaceholderTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
export const PlaceholderSubtitle = styled.p`
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;
export const PlaceholderDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  max-width: 800px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const StatLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 600;
`;
export const StatValue = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: 4px;
`;

export const ContentCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  svg {
    color: ${({ theme }) => theme.colors.primary};
    width: 16px;
    height: 16px;
  }
`;

export const FeaturesList = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const FeatureCheck = styled.span`
  width: 18px;
  height: 18px;
  background-color: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
`;

export const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderCard};
  flex-wrap: wrap;
`;

export const Button = styled.button<{
  $variant?: "primary" | "secondary" | "ghost";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  ${({ $variant, theme }) => {
    switch ($variant) {
      case "secondary":
        return `
          background-color: ${theme.colors.hoverSubtle};
          color: ${theme.colors.textPrimary};
          border-color: ${theme.colors.border};
          &:hover:not(:disabled) { background-color: ${theme.colors.hoverSecondary}; }
        `;
      case "ghost":
        return `
          background-color: transparent;
          color: ${theme.colors.primary};
          &:hover:not(:disabled) { background-color: ${theme.colors.primaryLight}; }
        `;
      case "primary":
      default:
        return `
          background-color: ${theme.colors.primary};
          color: ${theme.colors.textInverse};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
            box-shadow: ${theme.shadows.btnPrimary};
          }
        `;
    }
  }}
`;
