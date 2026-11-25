import React from "react";
import type { NavModule } from "@/types";
import { NAV_ITEMS } from "@/utils/navigation.utils";
import { useAuth } from "@/context/AuthContext";
import { canAccessModule } from "@/utils/permissions";
import {
  Monitor,
  Cpu,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Backdrop,
  SidebarContainer,
  BrandSection,
  LogoWrap,
  BrandText,
  BrandTitle,
  BrandPrimary,
  BrandAccent,
  BrandSubtitle,
  MobileCloseButton,
  StoreInfoBox,
  StoreIconPill,
  StoreDetails,
  StoreName,
  StoreBranch,
  LiveIndicatorDot,
  NavSection,
  NavHeading,
  NavMenuList,
  NavMenuItem,
  NavMenuButton,
  NavLinkLeft,
  NavLinkRight,
  SidebarBadge,
} from "./Sidebar.styles";

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    canAccessModule(user?.role, item.id),
  );

  return (
    <>
      <Backdrop $isOpen={isOpen} onClick={onClose} aria-hidden="true" />

      <SidebarContainer $isOpen={isOpen}>
        <BrandSection>
          <LogoWrap>
            <Cpu />
          </LogoWrap>
          <BrandText>
            <BrandTitle>
              <BrandPrimary>Stock</BrandPrimary>
              <BrandAccent>Wise</BrandAccent>
            </BrandTitle>
            <BrandSubtitle>Computer Shop ERP</BrandSubtitle>
          </BrandText>
          <MobileCloseButton onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </MobileCloseButton>
        </BrandSection>

        <StoreInfoBox>
          <StoreIconPill>
            <Monitor size={14} />
          </StoreIconPill>
          <StoreDetails>
            <StoreName>StockWise Computers BD</StoreName>
            <StoreBranch>Multiplan Branch • Dhaka</StoreBranch>
          </StoreDetails>
          <LiveIndicatorDot title="Terminal Online" />
        </StoreInfoBox>

        <NavSection>
          <NavHeading>MAIN MENU</NavHeading>
          <NavMenuList>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <NavMenuItem key={item.id}>
                  <NavMenuButton
                    $isActive={isActive}
                    onClick={() => {
                      onSelectModule(item.id);
                      onClose();
                    }}
                    type="button"
                  >
                    <NavLinkLeft>
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLinkLeft>
                    <NavLinkRight>
                      {item.badge && (
                        <SidebarBadge $variant={item.badgeVariant || "primary"}>
                          {item.badge}
                        </SidebarBadge>
                      )}
                      {isActive && <ChevronRight size={14} />}
                    </NavLinkRight>
                  </NavMenuButton>
                </NavMenuItem>
              );
            })}
          </NavMenuList>
        </NavSection>
      </SidebarContainer>
    </>
  );
};
