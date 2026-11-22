import styled from 'styled-components';

export const DashboardViewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StoreBanner = styled.section`
  background: linear-gradient(135deg, #1e1b4b, #312e81, #1e293b);
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 24px 28px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  box-shadow: 0 8px 20px rgba(30, 27, 75, 0.25);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const BannerContent = styled.div``;

export const LiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radius.full};
  font-size: 11px;
  font-weight: 600;
  color: #c7d2fe;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

export const PulseDot = styled.span`
  width: 6px;
  height: 6px;
  background-color: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 8px #34d399;
`;

export const BannerTitle = styled.h2`
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

export const BannerSubtitle = styled.p`
  color: #cbd5e1;
  font-size: 13.5px;
  margin-top: 4px;
  max-width: 650px;
  line-height: 1.45;
`;

export const BannerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
  flex-wrap: wrap;
`;

export const BannerButton = styled.button<{ $variant?: 'primary' | 'outline' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  ${({ $variant, theme }) =>
    $variant === 'outline'
      ? `background: rgba(255, 255, 255, 0.08); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.25); &:hover { background: rgba(255, 255, 255, 0.15); }`
      : `background-color: #ffffff; color: ${theme.colors.primaryHover}; border: 1px solid #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); &:hover { background-color: #f8fafc; transform: translateY(-1px); }`}
`;

export const MetricsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  ${({ theme }) => theme.media.desktopLg} { grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile} { grid-template-columns: 1fr; }
`;

export const QuickOpsBar = styled.section`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 20px 22px;
  margin-bottom: 24px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const QuickOpsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

export const QuickOpsTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const QuickOpsBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radius.sm};
`;

export const QuickOpsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  ${({ theme }) => theme.media.desktopLg} { grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile} { grid-template-columns: 1fr; }
`;

export const QuickOpButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background-color: #f8fafc;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  &:hover {
    background-color: #ffffff;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transform: translateY(-1px);
  }
`;

export const QuickOpIconWrap = styled.div<{ $colorVariant: 'emerald' | 'indigo' | 'amber' | 'rose' }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${({ $colorVariant, theme }) =>
    $colorVariant === 'emerald' ? theme.colors.successLight :
    $colorVariant === 'amber' ? theme.colors.warningLight :
    $colorVariant === 'rose' ? theme.colors.dangerLight : theme.colors.primaryLight};
  color: ${({ $colorVariant, theme }) =>
    $colorVariant === 'emerald' ? theme.colors.success :
    $colorVariant === 'amber' ? theme.colors.warning :
    $colorVariant === 'rose' ? theme.colors.danger : theme.colors.primary};
`;

export const QuickOpText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const QuickOpLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const QuickOpSub = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const SplitGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  margin-bottom: 24px;
  ${({ theme }) => theme.media.desktopLg} { grid-template-columns: 1fr; }
`;

export const SplitLeft = styled.div``;
export const SplitRight = styled.div``;

export const StatsStrip = styled.section`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderCard};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 16px 22px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const StatsStripHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
  svg { color: ${({ theme }) => theme.colors.primary}; }
`;

export const StatsStripGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  ${({ theme }) => theme.media.desktopLg} { grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile} { grid-template-columns: 1fr; }
`;

export const StatsStripItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  background-color: #f8fafc;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
`;

export const StatsStripLabel = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 600;
`;

export const StatsStripValue = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 4px 0 2px;
`;

export const StatsStripSub = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.success};
  display: flex;
  align-items: center;
  gap: 4px;
`;
