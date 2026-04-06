import { Box, Typography } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import type { GroupStanding, TournamentMatch } from "../../../types/match";
import KnockoutBracketCard from "./KnockoutBracketCard.tsx";

type AdminTournamentGroupsCardProps = {
    groupStandings: GroupStanding[];
    matches: TournamentMatch[];
    hasGeneratedBracket: boolean;
    readOnly?: boolean;
    onGenerateBracket?: () => void;
    onUpdateScore?: (match: TournamentMatch) => void;
    onScheduleMatch?: (match: TournamentMatch) => void;
    tournament?: { bracketType: string };
    onGenerateKnockout?: () => void;
};

const getTiebreakSuperscript = (matchSet: TournamentMatch["sets"][number]) => {
    if (matchSet.playerOneTiebreakPoints == null || matchSet.playerTwoTiebreakPoints == null) return null;
    if (matchSet.playerOneGames === matchSet.playerTwoGames) return null;
    const playerOneWonSet = matchSet.playerOneGames > matchSet.playerTwoGames;
    return playerOneWonSet ? matchSet.playerTwoTiebreakPoints : matchSet.playerOneTiebreakPoints;
};

type Tab = "groups" | "knockout";

function AdminTournamentGroupsCard({
                                       groupStandings,
                                       matches,
                                       onGenerateBracket,
                                       hasGeneratedBracket,
                                       onUpdateScore,
                                       readOnly = false,
                                       onScheduleMatch,
                                       tournament,
                                       onGenerateKnockout,
                                   }: AdminTournamentGroupsCardProps) {
    const [activeTab, setActiveTab] = useState<Tab>("groups");

    const maxPlayersInGroup = Math.max(...groupStandings.map((g) => g.players.length), 0);

    const knockoutMatches = matches.filter(m => m.phase === "KNOCKOUT");
    const groupMatches = matches.filter(m => m.phase === "GROUP_STAGE");
    const allGroupMatchesDone = groupMatches.length > 0 && groupMatches.every(m => m.status === "COMPLETED");
    const isRoundRobin = tournament?.bracketType === "Round Robin + Knockout";
    const showKnockoutTab = isRoundRobin;

    if (!hasGeneratedBracket) {
        if (readOnly) {
            return (
                <SectionCard>
                    <SectionTitle>Group standings &amp; matches</SectionTitle>
                    <SectionText>Group standings and match results will appear here after the bracket is generated.</SectionText>
                </SectionCard>
            );
        }
        return (
            <SectionCard>
                <SectionTitle>Bracket management</SectionTitle>
                <SectionText>Generate the tournament structure based on the selected bracket type.</SectionText>
                <ActionRow>
                    <GenerateBracketButton onClick={onGenerateBracket}>Generate bracket</GenerateBracketButton>
                </ActionRow>
            </SectionCard>
        );
    }

    return (
        <SectionCard>
            {showKnockoutTab && (
                <TabsRow>
                    <TabButton $active={activeTab === "groups"} onClick={() => setActiveTab("groups")}>
                        Group stage
                    </TabButton>
                    <TabButton $active={activeTab === "knockout"} onClick={() => setActiveTab("knockout")}>
                        Knockout
                    </TabButton>
                </TabsRow>
            )}

            {activeTab === "groups" && (
                <>
                    <SectionTitle>Group standings</SectionTitle>
                    {groupStandings.length === 0 ? (
                        <SectionText>Group standings will appear here after the round robin bracket is generated.</SectionText>
                    ) : (
                        <ScrollableGroupsRow>
                            {groupStandings.map((group) => {
                                const thisGroupMatches = matches.filter(
                                    m => m.phase === "GROUP_STAGE" && m.groupName === group.groupName
                                );
                                return (
                                    <GroupColumn key={group.groupName}>
                                        <GroupTitle>{group.groupName}</GroupTitle>
                                        <StandingsArea $maxPlayers={maxPlayersInGroup}>
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
                                        </StandingsArea>

                                        <MatchesSectionTitle>Matches</MatchesSectionTitle>

                                        {thisGroupMatches.length === 0 ? (
                                            <EmptyMatchesText>No matches generated for this group.</EmptyMatchesText>
                                        ) : (
                                            <MatchesList>
                                                {thisGroupMatches.map((match) => (
                                                    <MatchCard key={match.id}>
                                                        <MatchPlayersRow>
                                                            <PlayerName>{match.playerOneName ?? "TBD"}</PlayerName>
                                                            <VersusText>vs</VersusText>
                                                            <PlayerName>{match.playerTwoName ?? "TBD"}</PlayerName>
                                                        </MatchPlayersRow>

                                                        <MatchMetaRow>
                                                            <MatchStatusBadge $completed={match.status === "COMPLETED"}>
                                                                {match.status}
                                                            </MatchStatusBadge>
                                                            {match.winnerName ? <WinnerText>Winner: {match.winnerName}</WinnerText> : null}
                                                        </MatchMetaRow>

                                                        {match.sets.length > 0 ? (
                                                            <InlineScoreRow>
                                                                {match.sets.map((set, index) => {
                                                                    const tb = getTiebreakSuperscript(set);
                                                                    return (
                                                                        <SetInlineChunk key={set.setNumber}>
                                                                            <SetInlineScore>
                                                                                {set.playerOneGames}-{set.playerTwoGames}
                                                                                {tb != null ? <SetTiebreakSuperscript>{tb}</SetTiebreakSuperscript> : null}
                                                                            </SetInlineScore>
                                                                            {index < match.sets.length - 1 ? <SetSeparator>/</SetSeparator> : null}
                                                                        </SetInlineChunk>
                                                                    );
                                                                })}
                                                            </InlineScoreRow>
                                                        ) : (
                                                            <NoScoreText>No score added yet.</NoScoreText>
                                                        )}

                                                        {!readOnly && onUpdateScore ? (
                                                            <UpdateScoreButton onClick={() => onUpdateScore(match)}>
                                                                Update score
                                                            </UpdateScoreButton>
                                                        ) : null}

                                                        {!readOnly && onScheduleMatch && match.status !== "COMPLETED" && match.playerOneId != null && match.playerTwoId != null ? (
                                                            <ScheduleButton onClick={() => onScheduleMatch(match)}>
                                                                {match.scheduledTime ? "Edit schedule" : "Set schedule"}
                                                            </ScheduleButton>
                                                        ) : null}

                                                        {match.scheduledTime ? (
                                                            <ScheduleInfo>
                                                                {new Date(match.scheduledTime).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                                {match.locationName ? ` · ${match.locationName}` : ""}
                                                                {match.courtNumber != null ? ` · Court ${match.courtNumber}` : ""}
                                                            </ScheduleInfo>
                                                        ) : null}
                                                    </MatchCard>
                                                ))}
                                            </MatchesList>
                                        )}
                                    </GroupColumn>
                                );
                            })}
                        </ScrollableGroupsRow>
                    )}
                </>
            )}

            {activeTab === "knockout" && (
                <>
                    <SectionTitle>Knockout bracket</SectionTitle>
                    {knockoutMatches.length > 0 ? (
                        <KnockoutBracketCard
                            matches={matches}
                            readOnly={readOnly}
                            onUpdateScore={onUpdateScore}
                            onScheduleMatch={onScheduleMatch}
                            embedded
                        />
                    ) : allGroupMatchesDone ? (
                        <ActionRow>
                            {!readOnly && (
                                <GenerateBracketButton onClick={onGenerateKnockout}>
                                    Generate knockout bracket
                                </GenerateBracketButton>
                            )}
                            {readOnly && (
                                <SectionText>The knockout bracket has not been generated yet.</SectionText>
                            )}
                        </ActionRow>
                    ) : (
                        <SectionText>Not all group stage matches are completed. Finish all matches before generating the knockout bracket.</SectionText>
                    )}
                </>
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

const TabsRow = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  background: #ecfdf5;
  border-radius: 0.65rem;
  padding: 0.25rem;
  margin-bottom: 1.25rem;
  max-width: 22rem;
  margin-left: auto;
  margin-right: auto;  
`;

const TabButton = styled.button<{ $active: boolean }>`
    height: 2.8rem;
    border-radius: 0.5rem;
    border: ${({ $active }) => ($active ? "1px solid #a7f3d0" : "1px solid transparent")};
    background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
    color: ${({ $active }) => ($active ? "#047857" : "#64748b")};
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: 0.15s ease;
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
    margin-top: 0.5rem;
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
    &:hover { background: #059669; }
`;

const ScrollableGroupsRow = styled(Box)`
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 32rem;
    padding-bottom: 0.4rem;
    &::-webkit-scrollbar { height: 0.45rem; width: 0.4rem; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
`;

const GroupColumn = styled(Box)`
    min-width: 28rem;
    max-width: 28rem;
    height: 100%;
    flex: 0 0 28rem;
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
    margin-bottom: 1rem;
    th, td { text-align: left; padding: 0.6rem 0.4rem; border-bottom: 1px solid #e5e7eb; font-size: 0.84rem; }
    th { color: #475569; font-weight: 800; }
    td { color: #111827; font-weight: 500; }
    tbody tr:last-child td { border-bottom: none; }
`;

const StandingsArea = styled(Box)<{ $maxPlayers: number }>`
    min-height: ${({ $maxPlayers }) => `calc(1rem + ${$maxPlayers} * 3rem)`};
`;

const MatchesSectionTitle = styled(Typography)`
    font-size: 0.95rem !important;
    font-weight: 800 !important;
    color: #111827;
    margin-bottom: 0.6rem !important;
`;

const EmptyMatchesText = styled(Typography)`
    color: #64748b;
    font-size: 0.88rem !important;
`;

const MatchesList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
`;

const MatchCard = styled(Box)`
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    padding: 0.95rem;
    box-shadow: 0 0.35rem 1rem rgba(15, 23, 42, 0.04);
`;

const MatchPlayersRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
    margin-bottom: 0.45rem;
`;

const PlayerName = styled(Typography)`
    font-size: 0.9rem !important;
    font-weight: 700 !important;
    color: #111827;
`;

const VersusText = styled(Typography)`
    font-size: 0.82rem !important;
    color: #64748b;
    font-weight: 700 !important;
`;

const MatchMetaRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
`;

const MatchStatusBadge = styled(Typography)<{ $completed: boolean }>`
    width: fit-content;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.72rem !important;
    font-weight: 800 !important;
    background: ${({ $completed }) => ($completed ? "#dcfce7" : "#eff6ff")};
    color: ${({ $completed }) => ($completed ? "#15803d" : "#1d4ed8")};
`;

const WinnerText = styled(Typography)`
    font-size: 0.8rem !important;
    color: #475569;
    font-weight: 600 !important;
`;

const InlineScoreRow = styled(Box)`
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    column-gap: 0.35rem;
    margin-bottom: 0.7rem;
    padding: 0.35rem 0.55rem;
    border-radius: 0.7rem;
    background: #f8fafc;
`;

const SetInlineChunk = styled(Box)`
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
`;

const SetInlineScore = styled(Typography)`
    font-size: 0.9rem !important;
    font-weight: 700 !important;
    color: #0f172a;
`;

const SetSeparator = styled(Typography)`
    font-size: 0.9rem !important;
    font-weight: 700 !important;
    color: #64748b;
`;

const SetTiebreakSuperscript = styled.sup`
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 1;
    vertical-align: super;
`;

const NoScoreText = styled(Typography)`
    font-size: 0.8rem !important;
    color: #94a3b8;
    margin-bottom: 0.7rem !important;
`;

const UpdateScoreButton = styled.button`
    height: 2.3rem;
    padding: 0 0.85rem;
    border: none;
    border-radius: 999px;
    background: #10b981;
    color: white;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    &:hover { background: #059669; }
`;

const ScheduleButton = styled.button`
    height: 2.3rem;
    padding: 0 0.85rem;
    border: none;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 0.4rem;
    &:hover { background: #dbeafe; }
`;

const ScheduleInfo = styled(Typography)`
    font-size: 0.78rem !important;
    color: #64748b;
    margin-top: 0.35rem !important;
`;