import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { GroupStanding } from "../../../types/match";

type AdminTournamentGroupsCardProps = {
    groupStandings: GroupStanding[];
    onGenerateBracket: () => void;
    hasGeneratedBracket: boolean;
};

function AdminTournamentGroupsCard({
                                       groupStandings,
                                       onGenerateBracket,
                                       hasGeneratedBracket,
                                   }: AdminTournamentGroupsCardProps) {
    if (!hasGeneratedBracket) {
        return (
            <SectionCard>
                <SectionTitle>Bracket management</SectionTitle>
                <SectionText>
                    Generate the tournament structure based on the selected bracket type.
                </SectionText>

                <ActionRow>
                    <GenerateBracketButton onClick={onGenerateBracket}>
                        Generate bracket
                    </GenerateBracketButton>
                </ActionRow>
            </SectionCard>
        );
    }

    return (
        <SectionCard>
            <SectionTitle>Group standings</SectionTitle>

            {groupStandings.length === 0 ? (
                <SectionText>
                    Group standings will appear here after matches are completed.
                </SectionText>
            ) : (
                <GroupsWrapper>
                    {groupStandings.map((group) => (
                        <GroupCard key={group.groupName}>
                            <GroupTitle>{group.groupName}</GroupTitle>

                            <StyledTable>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Player</th>
                                    <th>W</th>
                                    <th>L</th>
                                    <th>Sets %</th>
                                    <th>Games %</th>
                                </tr>
                                </thead>

                                <tbody>
                                {group.players.map((player) => (
                                    <tr key={player.playerId}>
                                        <td>{player.position}</td>
                                        <td>{player.playerName}</td>
                                        <td>{player.wins}</td>
                                        <td>{player.losses}</td>
                                        <td>{player.setsWinPercentage}%</td>
                                        <td>{player.gamesWinPercentage}%</td>
                                    </tr>
                                ))}
                                </tbody>
                            </StyledTable>
                        </GroupCard>
                    ))}
                </GroupsWrapper>
            )}
        </SectionCard>
    );
}

export default AdminTournamentGroupsCard;

const SectionCard = styled(Box)`
    grid-column: 1 / -1;
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
    margin-bottom: 0.75rem !important;
`;

const SectionText = styled(Typography)`
    color: #64748b;
    line-height: 1.65 !important;
`;

const ActionRow = styled(Box)`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const GenerateBracketButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #059669;
  }
`;

const GroupsWrapper = styled(Box)`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

    @media (max-width: 72rem) {
        grid-template-columns: 1fr;
    }
`;

const GroupCard = styled(Box)`
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    background: #f8fafc;
    padding: 1rem;
`;

const GroupTitle = styled(Typography)`
    font-size: 1rem !important;
    font-weight: 800 !important;
    color: #111827;
    margin-bottom: 0.65rem !important;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        text-align: left;
        padding: 0.65rem 0.45rem;
        border-bottom: 1px solid #e5e7eb;
        font-size: 0.88rem;
    }

    th {
        color: #475569;
        font-weight: 800;
    }

    td {
        color: #111827;
        font-weight: 500;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }
`;