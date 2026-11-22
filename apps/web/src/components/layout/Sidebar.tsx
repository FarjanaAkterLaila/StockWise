import React from 'react';
import type { NavModule } from '../../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  WalletCards, 
  Monitor, 
  Cpu, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
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
  SidebarFooter,
  SystemCard,
  SystemHeader,
  SystemVersion,
  SystemDesc,
  SystemStatus,
} from './Sidebar.styles';

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemConfig {
  id: NavModule;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'primary' | 'warning' | 'danger';
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: Package, badge: '5 Low', badgeVariant: 'warning' },
  { id: 'accounts', label: 'Accounts', icon: WalletCards },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpen,
  onClose,
}) => {
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
            <StoreName>Apex Hardware & PC</StoreName>
            <StoreBranch>Main Branch • POS-1</StoreBranch>
          </StoreDetails>
          <LiveIndicatorDot title="Terminal Online" />
        </StoreInfoBox>

        <NavSection>
          <NavHeading>MAIN MENU</NavHeading>
          <NavMenuList>
            {NAV_ITEMS.map((item) => {
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
                        <SidebarBadge $variant={item.badgeVariant || 'primary'}>
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

        <SidebarFooter>
          <SystemCard>
            <SystemHeader>
              <ShieldCheck size={16} />
              <SystemVersion>v1.0.0 Ready</SystemVersion>
            </SystemHeader>
            <SystemDesc>
              All 12 Supabase ERP tables schema synchronized.
            </SystemDesc>
            <SystemStatus>
              <Sparkles size={12} />
              <span>Fast POS Mode</span>
            </SystemStatus>
          </SystemCard>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};
