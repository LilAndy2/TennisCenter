import { CameraAlt, Edit, Check, Close } from "@mui/icons-material";
import { Avatar, Box, CircularProgress, Typography } from "@mui/material";
import { useRef, useState } from "react";
import styled from "styled-components";
import type { PlayerProfile } from "../../types/profile";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
} from "../../styles/theme";

type ProfileInfoCardProps = {
    profile: PlayerProfile;
    isOwnProfile: boolean;
    uploadingImage: boolean;
    onUploadImage: (file: File) => void;
    onUpdateBio: (bio: string) => void;
};

function ProfileInfoCard({
                             profile,
                             isOwnProfile,
                             uploadingImage,
                             onUploadImage,
                             onUpdateBio,
                         }: ProfileInfoCardProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [editingBio, setEditingBio] = useState(false);
    const [bioText, setBioText] = useState(profile.bio ?? "");

    const handleAvatarClick = () => {
        if (isOwnProfile && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUploadImage(file);
        }
    };

    const levelColors = colors.levels[profile.playerLevel] ?? { bg: "#f8fafc", text: "#334155" };

    return (
        <CardWrapper>
            <TopSection>
                <AvatarSection>
                    <AvatarWrapper
                        $clickable={isOwnProfile}
                        onClick={handleAvatarClick}
                    >
                        {uploadingImage ? (
                            <LoadingOverlay>
                                <CircularProgress size={28} sx={{ color: "white" }} />
                            </LoadingOverlay>
                        ) : null}
                        {profile.profileImageUrl ? (
                            <StyledAvatar
                                src={`http://localhost:8080${profile.profileImageUrl}`}
                                alt={profile.firstName}
                            />
                        ) : (
                            <StyledAvatar>
                                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                            </StyledAvatar>
                        )}
                        {isOwnProfile && (
                            <CameraOverlay>
                                <CameraAlt sx={{ fontSize: 16, color: "white" }} />
                            </CameraOverlay>
                        )}
                    </AvatarWrapper>
                    {isOwnProfile && (
                        <HiddenInput
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    )}
                </AvatarSection>

                <InfoSection>
                    <NameRow>
                        <PlayerName>
                            {profile.firstName} {profile.lastName}
                        </PlayerName>
                        <LevelBadge $bg={levelColors.bg} $color={levelColors.text}>
                            {profile.playerLevel}
                        </LevelBadge>
                    </NameRow>
                    <Username>@{profile.username}</Username>

                    {editingBio ? (
                        <BioEditRow>
                            <BioTextarea
                                value={bioText}
                                onChange={(e) => setBioText(e.target.value)}
                                placeholder="Write something about yourself..."
                                autoFocus
                                maxLength={300}
                            />
                            <BioEditActions>
                                <BioActionButton
                                    $variant="confirm"
                                    onClick={() => {
                                        onUpdateBio(bioText);
                                        setEditingBio(false);
                                    }}
                                >
                                    <Check sx={{ fontSize: 16 }} />
                                </BioActionButton>
                                <BioActionButton
                                    $variant="cancel"
                                    onClick={() => {
                                        setBioText(profile.bio ?? "");
                                        setEditingBio(false);
                                    }}
                                >
                                    <Close sx={{ fontSize: 16 }} />
                                </BioActionButton>
                            </BioEditActions>
                        </BioEditRow>
                    ) : isOwnProfile ? (
                        <BioClickable onClick={() => setEditingBio(true)}>
                            {profile.bio ? (
                                <BioText>{profile.bio}</BioText>
                            ) : (
                                <BioPlaceholder>Add a bio...</BioPlaceholder>
                            )}
                            <Edit sx={{ fontSize: 14, color: colors.textHint }} />
                        </BioClickable>
                    ) : profile.bio ? (
                        <Bio>{profile.bio}</Bio>
                    ) : null}
                </InfoSection>
            </TopSection>

            <StatsGrid>
                <StatItem>
                    <StatValue>{profile.rankingPoints}</StatValue>
                    <StatLabel>Points</StatLabel>
                </StatItem>
                <StatDivider />
                <StatItem>
                    <StatValue>#{profile.rank || "—"}</StatValue>
                    <StatLabel>Rank</StatLabel>
                </StatItem>
                <StatDivider />
                <StatItem>
                    <StatValue>{profile.wins}</StatValue>
                    <StatLabel>Wins</StatLabel>
                </StatItem>
                <StatDivider />
                <StatItem>
                    <StatValue>{profile.losses}</StatValue>
                    <StatLabel>Losses</StatLabel>
                </StatItem>
                <StatDivider />
                <StatItem>
                    <StatValue>{profile.winRate}%</StatValue>
                    <StatLabel>Win Rate</StatLabel>
                </StatItem>
            </StatsGrid>
        </CardWrapper>
    );
}

export default ProfileInfoCard;

/* ─── Styled Components ─── */

const CardWrapper = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    box-shadow: ${shadow.sm};
`;

const TopSection = styled(Box)`
    display: flex;
    gap: ${spacing.lg};
    align-items: flex-start;
    margin-bottom: ${spacing.lg};

    @media (max-width: ${breakpoints.sm}) {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const AvatarSection = styled(Box)`
    flex-shrink: 0;
`;

const AvatarWrapper = styled(Box)<{ $clickable: boolean }>`
    position: relative;
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
    transition: all ${transition.normal};

    &:hover {
        ${({ $clickable }) =>
                $clickable &&
                `
            transform: scale(1.03);
            box-shadow: ${shadow.md};
        `}
    }
`;

const StyledAvatar = styled(Avatar)`
    width: 6rem !important;
    height: 6rem !important;
    font-size: 1.5rem !important;
    font-weight: ${fontWeight.bold} !important;
    background: ${colors.primaryLight} !important;
    color: ${colors.primaryDark} !important;
    border: 3px solid ${colors.borderGreen} !important;
`;

const CameraOverlay = styled(Box)`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background: ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${colors.surface};
    box-shadow: ${shadow.sm};
`;

const LoadingOverlay = styled(Box)`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
`;

const HiddenInput = styled.input`
    display: none;
`;

const InfoSection = styled(Box)`
    flex: 1;
    min-width: 0;
`;

const NameRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    flex-wrap: wrap;

    @media (max-width: ${breakpoints.sm}) {
        justify-content: center;
    }
`;

const PlayerName = styled(Typography)`
    font-size: 1.5rem !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    line-height: 1.2 !important;
`;

const LevelBadge = styled(Typography)<{ $bg: string; $color: string }>`
    padding: 0.25rem 0.7rem;
    border-radius: ${radius.pill};
    font-size: ${fontSize.xs} !important;
    font-weight: ${fontWeight.black} !important;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
`;

const Username = styled(Typography)`
    font-size: ${fontSize.base} !important;
    color: ${colors.textMuted};
    margin-top: 0.15rem !important;
`;

const Bio = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textSecondary};
    margin-top: ${spacing.xs} !important;
    line-height: 1.5 !important;
`;

const BioClickable = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: ${spacing.xs};
    cursor: pointer;
    padding: 0.3rem 0.5rem;
    margin-left: -0.5rem;
    border-radius: ${radius.md};
    transition: background ${transition.fast};

    &:hover {
        background: ${colors.surfaceAlt};
    }
`;

const BioText = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textSecondary};
    line-height: 1.5 !important;
`;

const BioPlaceholder = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textHint};
    font-style: italic;
    line-height: 1.5 !important;
`;

const BioEditRow = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: ${spacing.xs};
`;

const BioTextarea = styled.textarea`
    width: 100%;
    min-height: 4rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid ${colors.border};
    border-radius: ${radius.md};
    font-family: inherit;
    font-size: ${fontSize.sm};
    color: ${colors.textPrimary};
    line-height: 1.5;
    resize: vertical;
    outline: none;
    transition: border-color ${transition.fast};

    &::placeholder {
        color: ${colors.textHint};
    }

    &:focus {
        border-color: ${colors.primary};
    }
`;

const BioEditActions = styled(Box)`
    display: flex;
    gap: 0.35rem;
    align-self: flex-end;
`;

const BioActionButton = styled.button<{ $variant: "confirm" | "cancel" }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    border-radius: ${radius.sm};
    cursor: pointer;
    transition: all ${transition.fast};
    background: ${({ $variant }) =>
            $variant === "confirm" ? colors.primary : colors.surfaceAlt};
    color: ${({ $variant }) =>
            $variant === "confirm" ? "white" : colors.textMuted};

    &:hover {
        background: ${({ $variant }) =>
                $variant === "confirm" ? colors.primaryHover : colors.border};
    }

    &:active {
        transform: scale(0.93);
    }
`;

const StatsGrid = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${spacing.md};
    padding: ${spacing.md} 0;
    border-top: 1px solid ${colors.borderLight};
    border-bottom: 1px solid ${colors.borderLight};

    @media (max-width: ${breakpoints.sm}) {
        gap: ${spacing.sm};
    }
`;

const StatItem = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    min-width: 3.5rem;
`;

const StatValue = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    font-variant-numeric: tabular-nums;
`;

const StatLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    font-weight: ${fontWeight.medium} !important;
    text-transform: uppercase;
    letter-spacing: 0.03em;
`;

const StatDivider = styled(Box)`
    width: 1px;
    height: 2rem;
    background: ${colors.borderLight};
`;