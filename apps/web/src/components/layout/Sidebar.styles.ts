import styled, { css } from 'styled-components';

export const Backdrop = styled.div<{ $isOpen: boolean }>`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: block;
    position: fixed;
    inset: 0;
    background-color: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 45;
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
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
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
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
  background: linear-gradient(135deg, #4f46e5, #818cf8);
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.35);

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
  color: #ffffff;
`;

export const BrandAccent = styled.span`
  color: #818cf8;
`;

export const BrandSubtitle = styled.span`
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-top: 2px;
`;

export const MobileCloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  margin-left: auto;

  ${({ theme }) => theme.media.tablet} {
    display: block;
  }
`;

export const StoreInfoBox = styled.div`
  margin: 16px 16px 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${({ theme }) => theme.colors.borderSidebar};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StoreIconPill = styled.div`
  width: 28px;
  height: 28px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: ${({ theme }) => theme.radius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818cf8;
`;

export const StoreDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const StoreName = styled.span`
  color: #f1f5f9;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StoreBranch = styled.span`
  color: #64748b;
  font-size: 10px;
`;

export const LiveIndicatorDot = styled.span`
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
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
  color: #64748b;
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
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        `
      : css`
          background: transparent;
          color: #94a3b8;
          &:hover {
            background-color: ${theme.colors.backgroundSidebarHover};
            color: #ffffff;
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

export const SidebarBadge = styled.span<{ $variant?: 'primary' | 'warning' | 'danger' }>`
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radius.full};

  ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return 'background-color: rgba(245, 158, 11, 0.2); color: #fbbf24;';
      case 'danger':
        return 'background-color: rgba(225, 29, 72, 0.2); color: #fda4af;';
      case 'primary':
      default:
        return 'background-color: rgba(99, 102, 241, 0.2); color: #a5b4fc;';
    }
  }}
`;

export const SidebarFooter = styled.div`
  padding: 16px 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSidebar};
`;

export const SystemCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${({ theme }) => theme.colors.borderSidebar};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 12px;
`;

export const SystemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #818cf8;
`;

export const SystemVersion = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
`;

export const SystemDesc = styled.p`
  font-size: 10.5px;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.4;
`;

export const SystemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: #10b981;
  font-weight: 600;
  margin-top: 8px;
`;
