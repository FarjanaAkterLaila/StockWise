import styled, { css } from "styled-components";

export const Backdrop = styled.div<{ $isOpen: boolean }>`
  display: none;
  ${({ theme }) => theme.media.tablet} {
    display: block;
    position: fixed;
    inset: 0;
    background-color: ${({ theme }) => theme.colors.overlay};
    backdrop-filter: blur(4px);
    z-index: 45;
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transition: opacity 0.3s ease;
  }
`;

export const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  width: 260px;
  background-color: ${({ theme }) => theme.colors.backgroundSidebar};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  border-right: 1px solid ${({ theme }) => theme.colors.borderSidebar};
  z-index: 50;
  transition: transform 0.3s ease;
  ${({ theme }) => theme.media.tablet} {
    position: fixed;
    top: 0;
    left: 0;
    transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-100%)")};
    box-shadow: ${({ theme }) => theme.shadows.sidebarMobile};
  }
`;

export const BrandSection = styled.div`
  padding: 24px 20px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSidebar};
`;

export const LogoWrap = styled.div`
  width: 38px;
  height: 38px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.sidebarAccent}
  );
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textInverse};
  box-shadow: ${({ theme }) => theme.shadows.sidebarLogo};
  svg {
    width: 22px;
    height: 22px;
  }
`;

export const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;
export const BrandTitle = styled.div`
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
`;
export const BrandPrimary = styled.span`
  color: ${({ theme }) => theme.colors.textInverse};
`;
export const BrandAccent = styled.span`
  color: ${({ theme }) => theme.colors.sidebarAccent};
`;
export const BrandSubtitle = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-top: 2px;
`;

export const MobileCloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  margin-left: auto;
  ${({ theme }) => theme.media.tablet} {
    display: block;
  }
`;

export const StoreInfoBox = styled.div`
  margin: 16px 16px 8px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.sidebarSubtle};
  border: 1px solid ${({ theme }) => theme.colors.borderSidebar};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StoreIconPill = styled.div`
  width: 28px;
  height: 28px;
  background: ${({ theme }) => theme.colors.sidebarIconPill};
  border-radius: ${({ theme }) => theme.radius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.sidebarAccent};
`;

export const StoreDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;
export const StoreName = styled.span`
  color: ${({ theme }) => theme.colors.hoverSubtle};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const StoreBranch = styled.span`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 10px;
`;

export const LiveIndicatorDot = styled.span`
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.liveEmerald};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.dotLive};
`;

export const NavSection = styled.nav`
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
`;
export const NavHeading = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.textSubtle};
  padding: 0 12px 10px;
`;

export const NavMenuList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
export const NavMenuItem = styled.li``;

export const NavMenuButton = styled.button<{ $isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13.5px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  ${({ $isActive, theme }) =>
    $isActive
      ? css`
          background-color: ${theme.colors.backgroundSidebarActive};
          color: ${theme.colors.textInverse};
          box-shadow: ${theme.shadows.sidebarNavActive};
        `
      : css`
          background: transparent;
          color: ${theme.colors.textMuted};
          &:hover {
            background-color: ${theme.colors.backgroundSidebarHover};
            color: ${theme.colors.textInverse};
          }
        `}
`;

export const NavLinkLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
  svg {
    flex-shrink: 0;
  }
`;
export const NavLinkRight = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SidebarBadge = styled.span<{
  $variant?: "primary" | "warning" | "danger";
}>`
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ $variant, theme }) =>
    $variant === "warning"
      ? theme.colors.sidebarBadgeWarning
      : $variant === "danger"
        ? theme.colors.sidebarBadgeDanger
        : theme.colors.sidebarBadgePrimary};
  color: ${({ $variant, theme }) =>
    $variant === "warning"
      ? theme.colors.sidebarWarningText
      : $variant === "danger"
        ? theme.colors.sidebarDangerText
        : theme.colors.sidebarPrimaryText};
`;

export const SidebarFooter = styled.div`
  padding: 16px 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSidebar};
`;
export const SystemCard = styled.div`
  background: ${({ theme }) => theme.colors.sidebarSubtle};
  border: 1px solid ${({ theme }) => theme.colors.borderSidebar};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 12px;
`;
export const SystemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.sidebarAccent};
`;
export const SystemVersion = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.border};
`;
export const SystemDesc = styled.p`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-top: 4px;
  line-height: 1.4;
`;
export const SystemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.liveEmerald};
  font-weight: 600;
  margin-top: 8px;
`;
