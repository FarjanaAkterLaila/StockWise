import styled from "styled-components";

export const DashboardViewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StoreBanner = styled.section`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.bannerStart},
    ${({ theme }) => theme.colors.bannerMid},
    ${({ theme }) => theme.colors.bannerEnd}
  );
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 24px 28px;
  color: ${({ theme }) => theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  box-shadow: ${({ theme }) => theme.shadows.banner};
  position: relative;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.bannerGlow} 0%,
      transparent 70%
    );
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
  background: ${({ theme }) => theme.colors.bannerGlass};
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radius.full};
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryBorder};
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.bannerGlassBorder};
`;

export const PulseDot = styled.span`
  width: 6px;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.pulseEmerald};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.dotPulse};
`;

export const BannerTitle = styled.h2`
  color: ${({ theme }) => theme.colors.textInverse};
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

export const BannerSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.borderDashed};
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

export const BannerButton = styled.button<{ $variant?: "primary" | "outline" }>`
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
    $variant === "outline"
      ? `background: ${theme.colors.bannerGlassHover}; color: ${theme.colors.textInverse}; border: 1px solid ${theme.colors.bannerGlassActive}; &:hover { background: ${theme.colors.bannerGlassBorder}; }`
      : `background-color: ${theme.colors.background}; color: ${theme.colors.primaryHover}; border: 1px solid ${theme.colors.background}; box-shadow: ${theme.shadows.btnWhite}; &:hover { background-color: ${theme.colors.backgroundSubtle}; transform: translateY(-1px); }`}
`;

export const MetricsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
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
  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const QuickOpButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transform: translateY(-1px);
  }
`;

export const QuickOpIconWrap = styled.div<{
  $colorVariant: "emerald" | "indigo" | "amber" | "rose";
}>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${({ $colorVariant, theme }) =>
    $colorVariant === "emerald"
      ? theme.colors.successLight
      : $colorVariant === "amber"
        ? theme.colors.warningLight
        : $colorVariant === "rose"
          ? theme.colors.dangerLight
          : theme.colors.primaryLight};
  color: ${({ $colorVariant, theme }) =>
    $colorVariant === "emerald"
      ? theme.colors.success
      : $colorVariant === "amber"
        ? theme.colors.warning
        : $colorVariant === "rose"
          ? theme.colors.danger
          : theme.colors.primary};
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
  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: 1fr;
  }
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
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const StatsStripGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  ${({ theme }) => theme.media.desktopLg} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const StatsStripItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
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
