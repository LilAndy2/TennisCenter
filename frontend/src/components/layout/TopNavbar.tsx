import {
    AccountCircle,
    CalendarMonth,
    EmojiEventsOutlined,
    InfoOutlined,
    Logout,
    Person,
    Schedule,
    Settings,
    SportsTennis,
    AdminPanelSettings,
} from "@mui/icons-material";
import {
    Avatar,
    Box,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";

type StoredUser = {
    username: string;
    email: string;
    role: string;
    profileImageUrl?: string;
};

function TopNavbar() {
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("user");
    const parsedUser: StoredUser | null = useMemo(
        () => (storedUser ? JSON.parse(storedUser) : null),
        [storedUser]
    );

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path: string) => {
        handleCloseMenu();
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        handleCloseMenu();
        navigate("/login");
    };

    return (
        <NavbarWrapper>
            <NavbarContent>
                <LeftSection>
                    <BrandSection onClick={() => navigate("/feed")}>
                        <EmojiEventsOutlined sx={{ color: "#34d399", fontSize: 30 }} />
                        <BrandTextWrapper>
                            <BrandMutedText>Tennis</BrandMutedText>
                            <BrandText>Local</BrandText>
                        </BrandTextWrapper>
                    </BrandSection>

                    <NavItems>
                        <StyledNavLink to="/feed">
                            <NavItemContent>
                                <SportsTennis sx={{ fontSize: 18 }} />
                                <NavItemText>Feed</NavItemText>
                            </NavItemContent>
                        </StyledNavLink>

                        <StyledNavLink to="/tournaments">
                            <NavItemContent>
                                <EmojiEventsOutlined sx={{ fontSize: 18 }} />
                                <NavItemText>Tournaments</NavItemText>
                            </NavItemContent>
                        </StyledNavLink>

                        <StyledNavLink to="/schedule">
                            <NavItemContent>
                                <CalendarMonth sx={{ fontSize: 18 }} />
                                <NavItemText>Schedule</NavItemText>
                            </NavItemContent>
                        </StyledNavLink>

                        <StyledNavLink to="/h2h">
                            <NavItemContent>
                                <Schedule sx={{ fontSize: 18 }} />
                                <NavItemText>H2H</NavItemText>
                            </NavItemContent>
                        </StyledNavLink>

                        <StyledNavLink to="/leaderboard">
                            <NavItemContent>
                                <EmojiEventsOutlined sx={{ fontSize: 18 }} />
                                <NavItemText>Leaderboard</NavItemText>
                            </NavItemContent>
                        </StyledNavLink>

                        <StyledNavLink to="/about-us">
                            <NavItemContent>
                                <InfoOutlined sx={{ fontSize: 18 }} />
                                <NavItemText>About us</NavItemText>
                            </NavItemContent>
                        </StyledNavLink>

                        {parsedUser?.role === "ADMIN" || parsedUser?.role === "Admin" ? (
                            <StyledNavLink to="/admin">
                                <NavItemContent>
                                    <AdminPanelSettings sx={{ fontSize: 18 }} />
                                    <NavItemText>Admin Dashboard</NavItemText>
                                </NavItemContent>
                            </StyledNavLink>
                        ) : null}
                    </NavItems>
                </LeftSection>

                <RightSection>
                    <UserTextSection>
                        <UserNameText>{parsedUser?.username ?? "Player"}</UserNameText>
                        <UserRoleText>{parsedUser?.role ?? "USER"}</UserRoleText>
                    </UserTextSection>

                    <IconButton onClick={handleOpenMenu}>
                        {parsedUser?.profileImageUrl ? (
                            <StyledAvatar src={parsedUser.profileImageUrl} alt="Profile" />
                        ) : (
                            <StyledAvatar>
                                <AccountCircle sx={{ fontSize: 30 }} />
                            </StyledAvatar>
                        )}
                    </IconButton>

                    <StyledMenu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleCloseMenu}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        <MenuHeader>
                            <MenuUserName>{parsedUser?.username ?? "Player"}</MenuUserName>
                            <MenuUserEmail>{parsedUser?.email ?? ""}</MenuUserEmail>
                        </MenuHeader>

                        <Divider />

                        <MenuItem onClick={() => handleNavigate("/profile")}>
                            <MenuItemContent>
                                <Person sx={{ fontSize: 18 }} />
                                <span>Profile</span>
                            </MenuItemContent>
                        </MenuItem>

                        <MenuItem onClick={() => handleNavigate("/settings")}>
                            <MenuItemContent>
                                <Settings sx={{ fontSize: 18 }} />
                                <span>Settings</span>
                            </MenuItemContent>
                        </MenuItem>

                        <Divider />

                        <MenuItem onClick={handleLogout}>
                            <MenuItemContent>
                                <Logout sx={{ fontSize: 18 }} />
                                <span>Log out</span>
                            </MenuItemContent>
                        </MenuItem>
                    </StyledMenu>
                </RightSection>
            </NavbarContent>
        </NavbarWrapper>
    );
}

export default TopNavbar;

const NavbarWrapper = styled(Box)`
    position: sticky;
    top: 0;
    z-index: 1000;
    width: 100%;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(1rem);
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
`;

const NavbarContent = styled(Box)`
  height: 4.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  gap: 1.5rem;
`;

const LeftSection = styled(Box)`
  display: flex;
  align-items: center;
  gap: 2rem;
  min-width: 0;
`;

const RightSection = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BrandSection = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  flex-shrink: 0;
`;

const BrandTextWrapper = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const BrandMutedText = styled(Typography)`
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  color: #475569;
  line-height: 1 !important;
`;

const BrandText = styled(Typography)`
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  color: #10b981;
  line-height: 1 !important;
`;

const NavItems = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: inherit;
  border-radius: 999px;

  &.active {
    background: #ecfdf5;
  }

  &.active div {
    color: #059669;
    font-weight: 700;
  }
`;

const NavItemContent = styled(Box)`
  height: 2.6rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  color: #334155;
  transition: all 0.2s ease;

  &:hover {
    background: #f0fdf4;
    color: #047857;
  }
`;

const NavItemText = styled(Typography)`
  font-size: 0.95rem !important;
  font-weight: 600 !important;
`;

const UserTextSection = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 0.15rem;
`;

const UserNameText = styled(Typography)`
  font-size: 0.92rem !important;
  font-weight: 700 !important;
  color: #111827;
  line-height: 1.2 !important;
`;

const UserRoleText = styled(Typography)`
  font-size: 0.78rem !important;
  color: #64748b;
  line-height: 1.2 !important;
`;

const StyledAvatar = styled(Avatar)`
  width: 2.75rem !important;
  height: 2.75rem !important;
  background: #ecfdf5 !important;
  color: #059669 !important;
  border: 2px solid #d1fae5;
`;

const StyledMenu = styled(Menu)`
  .MuiPaper-root {
    min-width: 14rem;
    margin-top: 0.4rem;
    border-radius: 1rem;
    box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, 0.14);
    border: 1px solid #d1fae5;
  }
`;

const MenuHeader = styled(Box)`
  padding: 0.9rem 1rem 0.8rem 1rem;
`;

const MenuUserName = styled(Typography)`
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  color: #111827;
`;

const MenuUserEmail = styled(Typography)`
  font-size: 0.82rem !important;
  color: #64748b;
  margin-top: 0.15rem !important;
`;

const MenuItemContent = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;
