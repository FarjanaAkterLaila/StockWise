import React from "react";
import type { NavModule } from "@/types";
import { NAV_MODULES } from "@/utils/constants";
import { MODULE_TITLES } from "@/utils/navigation.utils";
import { useAuth } from "@/context/AuthContext";
import { formatRoleLabel, hasPermission } from "@/utils/permissions";
import {
  Menu,
  Search,
  PlusCircle,
  CheckCircle2,
  LogOut,
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
  HeaderIconButton,
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
  const { user, logout } = useAuth();
  const currentInfo = MODULE_TITLES[activeModule];

  const initials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "OP";

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
        {activeModule !== NAV_MODULES.DASHBOARD && (
          <>
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

            {hasPermission(user?.role, "sales", "create") && (
              <ActionButton
                onClick={onOpenQuickSale}
                type="button"
                title="Create a new POS sale invoice"
              >
                <PlusCircle size={16} />
                <span>New Sale</span>
              </ActionButton>
            )}

            <HeaderDivider />
          </>
        )}

        <ProfileButton
          tabIndex={0}
          role="button"
          title={`Logged in as ${formatRoleLabel(user?.role)}`}
        >
          <AvatarWrap>
            <span>{initials}</span>
            <AvatarLiveDot title={`Role: ${formatRoleLabel(user?.role)}`} />
          </AvatarWrap>

          <ProfileInfo>
            <ProfileName>{user?.fullName || "Operator"}</ProfileName>
            <ProfileRole>
              <CheckCircle2 size={11} />
              {formatRoleLabel(user?.role).toUpperCase()}
            </ProfileRole>
          </ProfileInfo>

          <HeaderIconButton
            as="div"
            role="button"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              logout();
            }}
            title="Log Out"
            style={{ width: "28px", height: "28px", marginLeft: "4px" }}
          >
            <LogOut size={14} />
          </HeaderIconButton>
        </ProfileButton>
      </HeaderRight>
    </HeaderContainer>
  );
};
