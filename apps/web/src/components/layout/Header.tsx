import React from 'react';
import type { NavModule } from '../../types';
import { 
  Menu, 
  Search, 
  Bell, 
  PlusCircle, 
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';
import {
  HeaderContainer,
  HeaderLeft,
  MobileToggleBtn,
  TitleBlock,
  PageTitle,
  PageSubtitle,
  HeaderRight,
  SearchWrapper,
  SearchIconWrap,
  SearchInput,
  SearchShortcut,
  ActionButton,
  IconBtnWrap,
  HeaderIconButton,
  NotificationDot,
  HeaderDivider,
  ProfileButton,
  AvatarWrap,
  AvatarLiveDot,
  ProfileInfo,
  ProfileName,
  ProfileRole,
} from './Header.styles';

interface HeaderProps {
  activeModule: NavModule;
  onToggleSidebar: () => void;
  onOpenQuickSale?: () => void;
}

const MODULE_TITLES: Record<NavModule, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time sales, inventory alerts, and store performance'
  },
  sales: {
    title: 'Sales & Invoices',
    subtitle: 'Point of sale terminal, customer billing, and transaction logs'
  },
  purchase: {
    title: 'Purchases & Restock',
    subtitle: 'Vendor purchase orders, incoming stock intake, and payables'
  },
  inventory: {
    title: 'Inventory Catalog',
    subtitle: 'Hardware SKUs, real-time stock levels, and minimum thresholds'
  },
  accounts: {
    title: 'Financial Accounts',
    subtitle: 'Expense ledger, cash drawer balance, and store margin analytics'
  }
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onToggleSidebar,
  onOpenQuickSale
}) => {
  const currentInfo = MODULE_TITLES[activeModule];

  return (
    <HeaderContainer>
      <HeaderLeft>
        <MobileToggleBtn onClick={onToggleSidebar} aria-label="Toggle navigation menu">
          <Menu size={20} />
        </MobileToggleBtn>

        <TitleBlock>
          <PageTitle>{currentInfo.title}</PageTitle>
          <PageSubtitle>{currentInfo.subtitle}</PageSubtitle>
        </TitleBlock>
      </HeaderLeft>

      <HeaderRight>
        <SearchWrapper>
          <SearchIconWrap>
            <Search size={16} />
          </SearchIconWrap>
          <SearchInput
            type="text"
            placeholder="Search invoice, SKU, customer..."
            aria-label="Global search"
          />
          <SearchShortcut>⌘K</SearchShortcut>
        </SearchWrapper>

        <ActionButton onClick={onOpenQuickSale} type="button" title="Create a new POS sale invoice">
          <PlusCircle size={16} />
          <span>New Sale</span>
        </ActionButton>

        <IconBtnWrap>
          <HeaderIconButton aria-label="Notifications" title="5 low stock items need attention">
            <Bell size={18} />
            <NotificationDot />
          </HeaderIconButton>
        </IconBtnWrap>

        <HeaderDivider />

        <ProfileButton tabIndex={0} role="button">
          <AvatarWrap>
            <span>AT</span>
            <AvatarLiveDot title="Logged in as Admin" />
          </AvatarWrap>

          <ProfileInfo>
            <ProfileName>Alex Turner</ProfileName>
            <ProfileRole>
              <CheckCircle2 size={11} />
              Store Manager
            </ProfileRole>
          </ProfileInfo>

          <ChevronDown size={14} color="#94a3b8" />
        </ProfileButton>
      </HeaderRight>
    </HeaderContainer>
  );
};
