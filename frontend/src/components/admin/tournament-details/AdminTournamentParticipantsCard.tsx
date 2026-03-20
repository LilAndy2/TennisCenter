import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentParticipantType } from "../../../types/tournament";

type AdminTournamentParticipantsCardProps = {
    participants: TournamentParticipantType[];
    onRemoveParticipant: (participant: TournamentParticipantType) => void;
};

function AdminTournamentParticipantsCard({
                                             participants,
                                             onRemoveParticipant,
                                         }: AdminTournamentParticipantsCardProps) {
    return (
        <SectionCard>
            <SectionTitle>Registered players</SectionTitle>

            {participants.length === 0 ? (
                <SectionText>No players registered yet.</SectionText>
            ) : (
                <ParticipantsList>
                    {participants.map((participant) => (
                        <ParticipantItem key={participant.id}>
                            <ParticipantLeftColumn>
                                <ParticipantName>{participant.fullName}</ParticipantName>
                                <ParticipantEmail>{participant.email}</ParticipantEmail>
                            </ParticipantLeftColumn>

                            <ParticipantRightColumn>
                                <ParticipantDate>
                                    Registered on{" "}
                                    {new Date(participant.registeredAt).toLocaleDateString()}
                                </ParticipantDate>

                                <RemoveParticipantButton
                                    onClick={() => onRemoveParticipant(participant)}
                                >
                                    Remove
                                </RemoveParticipantButton>
                            </ParticipantRightColumn>
                        </ParticipantItem>
                    ))}
                </ParticipantsList>
            )}
        </SectionCard>
    );
}

export default AdminTournamentParticipantsCard;

const SectionCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.2rem;
  padding: 1.3rem;
  box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.03);
`;

const SectionTitle = styled(Typography)`
  font-size: 1.1rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.45rem !important;
`;

const SectionText = styled(Typography)`
  color: #64748b;
  line-height: 1.65 !important;
`;

const ParticipantsList = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 11rem;
  overflow-y: auto;
  padding-right: 0.35rem;

  &::-webkit-scrollbar {
    width: 0.4rem;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }
`;

const ParticipantItem = styled(Box)`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;

  @media (max-width: 40rem) {
    flex-direction: column;
    align-items: stretch;
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

  @media (max-width: 40rem) {
    align-items: flex-start;
  }
`;

const ParticipantName = styled(Typography)`
  font-size: 0.96rem !important;
  font-weight: 700 !important;
  color: #111827;
`;

const ParticipantEmail = styled(Typography)`
  font-size: 0.86rem !important;
  color: #475569;
`;

const ParticipantDate = styled(Typography)`
  font-size: 0.8rem !important;
  color: #64748b;
  text-align: right;

  @media (max-width: 40rem) {
    text-align: left;
  }
`;

const RemoveParticipantButton = styled.button`
  width: fit-content;
  height: 2.2rem;
  padding: 0 0.9rem;
  border: none;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #fecaca;
  }
`;