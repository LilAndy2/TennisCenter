import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import {
    SectionCard as BaseSectionCard,
    SectionTitle as BaseSectionTitle,
    SectionText,
} from "../../common/SectionCard";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
    breakpoints,
} from "../../../styles/theme";

type Participant = {
    id: number;
    fullName: string;
    email: string;
    registeredAt: string;
};

type AdminTournamentParticipantsCardProps = {
    participants: Participant[];
    onRemoveParticipant: (participant: Participant) => void;
};

function AdminTournamentParticipantsCard({
                                             participants,
                                             onRemoveParticipant,
                                         }: AdminTournamentParticipantsCardProps) {
    return (
        <BaseSectionCard>
            <BaseSectionTitle>
                Participants ({participants.length})
            </BaseSectionTitle>

            {participants.length === 0 ? (
                <SectionText>No players registered yet.</SectionText>
            ) : (
                <ParticipantsList>
                    {participants.map((p) => (
                        <ParticipantItem key={p.id}>
                            <ParticipantLeftColumn>
                                <ParticipantName>{p.fullName}</ParticipantName>
                                <ParticipantEmail>{p.email}</ParticipantEmail>
                            </ParticipantLeftColumn>

                            <ParticipantRightColumn>
                                <ParticipantDate>
                                    {new Date(p.registeredAt).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </ParticipantDate>
                                <RemoveParticipantButton onClick={() => onRemoveParticipant(p)}>
                                    Remove
                                </RemoveParticipantButton>
                            </ParticipantRightColumn>
                        </ParticipantItem>
                    ))}
                </ParticipantsList>
            )}
        </BaseSectionCard>
    );
}

export default AdminTournamentParticipantsCard;

const ParticipantsList = styled(Box)`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${spacing.sm};
    max-height: 12.5rem;
    overflow-y: auto;
    padding-right: 0.35rem;

    @media (max-width: 72rem) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: ${breakpoints.md}) {
        grid-template-columns: 1fr;
    }
`;

const ParticipantItem = styled(Box)`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${spacing.md};
    min-height: 5.4rem;
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${radius.md};
    background: ${colors.surfaceHover};
    border: 1px solid ${colors.border};
    transition: border-color ${transition.normal};

    &:hover {
        border-color: ${colors.borderGreen};
    }
`;

const ParticipantLeftColumn = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    min-width: 0;
`;

const ParticipantRightColumn = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.45rem;
    flex-shrink: 0;

    @media (max-width: ${breakpoints.sm}) {
        align-items: flex-start;
    }
`;

const ParticipantName = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const ParticipantEmail = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textSecondary};
`;

const ParticipantDate = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    text-align: right;

    @media (max-width: ${breakpoints.sm}) {
        text-align: left;
    }
`;

const RemoveParticipantButton = styled.button`
    width: fit-content;
    height: 2.2rem;
    padding: 0 0.9rem;
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.dangerBg};
    color: ${colors.danger};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.dangerBgHover};
    }

    &:active {
        transform: scale(0.95);
    }
`;