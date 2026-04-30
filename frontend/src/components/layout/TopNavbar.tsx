import {
    AccountCircle,
    CalendarMonth,
    Close,
    EmojiEventsOutlined,
    InfoOutlined,
    Logout,
    Menu as MenuIcon,
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
    Drawer,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
    zIndex,
    navbar,
} from "../../styles/theme";

type StoredUser = {
    username: string;
    email: string;
    role: string;
    profileImageUrl?: string;
};

function TopNavbar() {
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

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
        setMobileOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        handleCloseMenu();
        setMobileOpen(false);
        navigate("/login");
    };

    const isAdmin = parsedUser?.role === "ADMIN" || parsedUser?.role === "Admin";

    const navItems = (
        <>
            <StyledNavLink to="/feed" onClick={() => setMobileOpen(false)}>
                <NavItemContent>
                    <SportsTennis sx={{ fontSize: 18 }} />
                    <NavItemText>Feed</NavItemText>
                </NavItemContent>
            </StyledNavLink>

            <StyledNavLink to="/tournaments" onClick={() => setMobileOpen(false)}>
                <NavItemContent>
                    <EmojiEventsOutlined sx={{ fontSize: 18 }} />
                    <NavItemText>Tournaments</NavItemText>
                </NavItemContent>
            </StyledNavLink>

            <StyledNavLink to="/schedule" onClick={() => setMobileOpen(false)}>
                <NavItemContent>
                    <CalendarMonth sx={{ fontSize: 18 }} />
                    <NavItemText>Schedule</NavItemText>
                </NavItemContent>
            </StyledNavLink>

            <StyledNavLink to="/h2h" onClick={() => setMobileOpen(false)}>
                <NavItemContent>
                    <Schedule sx={{ fontSize: 18 }} />
                    <NavItemText>H2H</NavItemText>
                </NavItemContent>
            </StyledNavLink>

            <StyledNavLink to="/leaderboard" onClick={() => setMobileOpen(false)}>
                <NavItemContent>
                    <EmojiEventsOutlined sx={{ fontSize: 18 }} />
                    <NavItemText>Leaderboard</NavItemText>
                </NavItemContent>
            </StyledNavLink>

            <StyledNavLink to="/about-us" onClick={() => setMobileOpen(false)}>
                <NavItemContent>
                    <InfoOutlined sx={{ fontSize: 18 }} />
                    <NavItemText>About us</NavItemText>
                </NavItemContent>
            </StyledNavLink>

            {isAdmin ? (
                <StyledNavLink to="/admin" onClick={() => setMobileOpen(false)}>
                    <NavItemContent>
                        <AdminPanelSettings sx={{ fontSize: 18 }} />
                        <NavItemText>Admin</NavItemText>
                    </NavItemContent>
                </StyledNavLink>
            ) : null}
        </>
    );

    return (
        <>
            <NavbarWrapper>
                <NavbarContent>
                    <LeftSection>
                        {/* Mobile hamburger */}
                        <MobileMenuButton onClick={() => setMobileOpen(true)}>
                            <MenuIcon sx={{ fontSize: 24 }} />
                        </MobileMenuButton>

                        <BrandSection onClick={() => navigate("/feed")}>
                            <SportsTennis sx={{ color: colors.primary, fontSize: 28 }} />
                            <BrandTextWrapper>
                                <BrandMutedText>Tennis</BrandMutedText>
                                <BrandAccentText>Local</BrandAccentText>
                            </BrandTextWrapper>
                        </BrandSection>

                        <DesktopNavItems>
                            {navItems}
                        </DesktopNavItems>
                    </LeftSection>

                    <RightSection>
                        <UserTextSection>
                            <UserNameText>{parsedUser?.username ?? "Player"}</UserNameText>
                            <UserRoleText>{parsedUser?.role ?? "USER"}</UserRoleText>
                        </UserTextSection>

                        <IconButton onClick={handleOpenMenu} aria-label="Open user menu">
                            {parsedUser?.profileImageUrl ? (
                                <StyledAvatar src={parsedUser.profileImageUrl} alt="Profile" />
                            ) : (
                                <StyledAvatar>
                                    <AccountCircle sx={{ fontSize: 28 }} />
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

            {/* Mobile drawer */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{
                    sx: {
                        width: "18rem",
                        borderRight: `1px solid ${colors.borderGreen}`,
                        background: colors.surface,
                    }
                }}
            >
                <DrawerHeader>
                    <BrandSection onClick={() => handleNavigate("/feed")}>
                        <SportsTennis sx={{ color: colors.primary, fontSize: 26 }} />
                        <BrandTextWrapper>
                            <BrandMutedText>Tennis</BrandMutedText>
                            <BrandAccentText>Local</BrandAccentText>
                        </BrandTextWrapper>
                    </BrandSection>

                    <IconButton onClick={() => setMobileOpen(false)} aria-label="Close menu">
                        <Close sx={{ fontSize: 22 }} />
                    </IconButton>
                </DrawerHeader>

                <Divider />

                <DrawerNav>
                    {navItems}
                </DrawerNav>

                <Divider />

                <DrawerFooter>
                    <DrawerUserInfo>
                        <UserNameText>{parsedUser?.username ?? "Player"}</UserNameText>
                        <UserRoleText>{parsedUser?.role ?? "USER"}</UserRoleText>
                    </DrawerUserInfo>
                </DrawerFooter>
            </Drawer>
        </>
    );
}

export default TopNavbar;

/* ─── Styled Components ─── */

const NavbarWrapper = styled(Box)`
    position: sticky;
    top: 0;
    z-index: ${zIndex.navbar};
    width: 100%;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid ${colors.border};
    box-shadow: ${shadow.xs};
`;

const NavbarContent = styled(Box)`
    height: ${navbar.height};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${spacing.xl};
    gap: ${spacing.lg};

    @media (max-width: ${breakpoints.md}) {
        padding: 0 ${spacing.md};
        height: ${navbar.mobileHeight};
    }
`;

const LeftSection = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.lg};
    min-width: 0;
`;

const RightSection = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
`;

const MobileMenuButton = styled(IconButton)`
    display: none !important;

    @media (max-width: ${breakpoints.lg}) {
        display: flex !important;
    }
`;

const BrandSection = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    flex-shrink: 0;
`;

const BrandTextWrapper = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.3rem;
`;

const BrandMutedText = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textSecondary};
    line-height: 1 !important;
`;

const BrandAccentText = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.primary};
    line-height: 1 !important;
`;

const DesktopNavItems = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.25rem;

    @media (max-width: ${breakpoints.lg}) {
        display: none;
    }
`;

const StyledNavLink = styled(NavLink)`
    text-decoration: none;
    color: inherit;
    border-radius: ${radius.pill};
    position: relative;

    &.active div {
        color: ${colors.primaryHover};
        font-weight: ${fontWeight.bold};
        background: ${colors.primaryLighter};
    }
    
    &.active::after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 1.5rem;
        height: 2px;
        background: ${colors.primary};
        border-radius: 1px;
    }
`;

const NavItemContent = styled(Box)`
    height: 2.75rem;
    min-width: 2.75rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 ${spacing.sm};
    border-radius: ${radius.pill};
    color: ${colors.textSecondary};
    transition: all ${transition.normal};
    cursor: pointer;

    &:hover {
        background: ${colors.primaryLighter};
        color: ${colors.primaryActive};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const NavItemText = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.semibold} !important;
    white-space: nowrap;
`;

const UserTextSection = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-right: 0.15rem;

    @media (max-width: ${breakpoints.md}) {
        display: none;
    }
`;

const UserNameText = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    line-height: 1.2 !important;
`;

const UserRoleText = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    line-height: 1.2 !important;
`;

const StyledAvatar = styled(Avatar)`
    width: 2.5rem !important;
    height: 2.5rem !important;
    background: ${colors.primaryLighter} !important;
    color: ${colors.primaryHover} !important;
    border: 2px solid ${colors.primaryLight};
    transition: border-color ${transition.normal};

    &:hover {
        border-color: ${colors.primary};
    }
`;

const StyledMenu = styled(Menu)`
    .MuiPaper-root {
        min-width: 14rem;
        margin-top: 0.4rem;
        border-radius: ${radius.lg};
        box-shadow: ${shadow.xl};
        border: 1px solid ${colors.borderGreen};
    }
`;

const MenuHeader = styled(Box)`
    padding: ${spacing.sm} ${spacing.md} ${spacing.xs} ${spacing.md};
`;

const MenuUserName = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const MenuUserEmail = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    margin-top: 0.15rem !important;
`;

const MenuItemContent = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.65rem;
`;

/* ─── Mobile Drawer ─── */

const DrawerHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.md} ${spacing.md};
`;

const DrawerNav = styled(Box)`
    display: flex;
    flex-direction: column;
    padding: ${spacing.xs} ${spacing.xs};
    gap: 0.15rem;

    a {
        &.active::after {
            display: none;  /* No bottom indicator in drawer */
        }
    }

    ${NavItemContent} {
        height: 3rem;
        padding: 0 ${spacing.md};
        border-radius: ${radius.md};
    }
`;

const DrawerFooter = styled(Box)`
    padding: ${spacing.md};
`;

const DrawerUserInfo = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`;