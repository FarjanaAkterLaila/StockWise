import styled from "styled-components";

export const HeaderContainer = styled.header`
  height: 72px;
  background-color: ${({ theme }) => theme.colors.backgroundHeader};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: ${({ theme }) => theme.shadows.header};
  ${({ theme }) => theme.media.tablet} {
    padding: 0 20px;
  }
  ${({ theme }) => theme.media.mobile} {
    padding: 0 12px;
    height: 60px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  ${({ theme }) => theme.media.mobile} {
    gap: 10px;
  }
`;

export const MobileToggleBtn = styled.button`
  display: none;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 7px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  ${({ theme }) => theme.media.tablet} {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const TitleBlock = styled.div``;
export const PageTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.3px;
  ${({ theme }) => theme.media.mobile} {
    font-size: 15px;
  }
`;
export const PageSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 500;
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;
export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  ${({ theme }) => theme.media.mobile} {
    gap: 8px;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 320px;
  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;

export const SearchIconWrap = styled.div`
  position: absolute;
  left: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
  display: flex;
  align-items: center;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 46px 8px 36px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.shadows.focusPrimary};
  }
`;

export const SearchShortcut = styled.span`
  position: absolute;
  right: 10px;
  font-size: 10px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1px 5px;
  border-radius: 4px;
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid transparent;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.btnPrimary};
  }
  ${({ theme }) => theme.media.mobile} {
    padding: 7px 10px;
    font-size: 12px;
    gap: 5px;
  }
`;

export const IconBtnWrap = styled.div`
  position: relative;
`;

export const HeaderIconButton = styled.button`
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const NotificationDot = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.danger};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.background};
`;

export const HeaderDivider = styled.div`
  width: 1px;
  height: 28px;
  background-color: ${({ theme }) => theme.colors.border};
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

export const ProfileButton = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 4px;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverSubtle};
  }
`;

export const AvatarWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.avatarStart},
    ${({ theme }) => theme.colors.avatarEnd}
  );
  color: ${({ theme }) => theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  position: relative;
`;

export const AvatarLiveDot = styled.span`
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 9px;
  height: 9px;
  background-color: ${({ theme }) => theme.colors.liveEmerald};
  border: 2px solid ${({ theme }) => theme.colors.background};
  border-radius: 50%;
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;
export const ProfileName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.2;
`;
export const ProfileRole = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 3px;
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
