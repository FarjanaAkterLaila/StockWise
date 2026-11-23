import React from "react";
import { useTheme } from "styled-components";
import type { NavModule } from "@/types";
import { MODULE_TITLES } from "@/utils/navigation.utils";
import {
  Menu,
  Search,
  Bell,
  PlusCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
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
} from "./Header.styles";

interface HeaderProps {
  activeModule: NavModule;
  onToggleSidebar: () => void;
  onOpenQuickSale?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onToggleSidebar,
  onOpenQuickSale,
}) => {
  const theme = useTheme();
  const currentInfo = MODULE_TITLES[activeModule];

  return (
    <HeaderContainer>
      <HeaderLeft>
        <MobileToggleBtn
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
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

        <ActionButton
          onClick={onOpenQuickSale}
          type="button"
          title="Create a new POS sale invoice"
        >
          <PlusCircle size={16} />
          <span>New Sale</span>
        </ActionButton>

        <IconBtnWrap>
          <HeaderIconButton
            aria-label="Notifications"
            title="5 low stock items need attention"
          >
            <Bell size={18} />
            <NotificationDot />
          </HeaderIconButton>
        </IconBtnWrap>

        <HeaderDivider />

        <ProfileButton tabIndex={0} role="button">
          <AvatarWrap>
            <span>TA</span>
            <AvatarLiveDot title="Logged in as Admin" />
          </AvatarWrap>

          <ProfileInfo>
            <ProfileName>Tanvir Ahmed</ProfileName>
            <ProfileRole>
              <CheckCircle2 size={11} />
              Store Manager
            </ProfileRole>
          </ProfileInfo>

          <ChevronDown size={14} color={theme.colors.textMuted} />
        </ProfileButton>
      </HeaderRight>
    </HeaderContainer>
  );
};
