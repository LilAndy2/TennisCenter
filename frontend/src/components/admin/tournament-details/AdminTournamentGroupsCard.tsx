import { Box } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import type { GroupStanding, TournamentMatch } from "../../../types/match";
import { SectionCard, SectionTitle, SectionText, ActionRow } from "../../common/SectionCard";
import GroupColumn from "./GroupColumn";
import KnockoutBracketCard from "./KnockoutBracketCard";

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
    const knockoutMatches = matches.filter((m) => m.phase === "KNOCKOUT");
    const groupMatches = matches.filter((m) => m.phase === "GROUP_STAGE");
    const allGroupMatchesDone =
        groupMatches.length > 0 && groupMatches.every((m) => m.status === "COMPLETED");
    const isRoundRobin = tournament?.bracketType === "Round Robin + Knockout";
    const isSingleElimination = tournament?.bracketType === "Single Elimination";

    if (isSingleElimination) {
        return (
            <SectionCard>
                <SectionTitle>Knockout bracket</SectionTitle>
                {knockoutMatches.length > 0 ? (
                    <KnockoutBracketCard
                        matches={matches}
                        readOnly={readOnly}
                        onUpdateScore={onUpdateScore}
                        onScheduleMatch={onScheduleMatch}
                        embedded
                    />
                ) : (
                    <>
                        <SectionText>
                            Generate the bracket to set up the draw for this tournament.
                        </SectionText>
                        {!readOnly ? (
                            <ActionRow>
                                <GenerateBracketButton onClick={onGenerateBracket}>
                                    Generate bracket
                                </GenerateBracketButton>
                            </ActionRow>
                        ) : (
                            <SectionText>The bracket has not been generated yet.</SectionText>
                        )}
                    </>
                )}
            </SectionCard>
        );
    }

    if (!hasGeneratedBracket) {
        if (readOnly) {
            return (
                <SectionCard>
                    <SectionTitle>Group standings &amp; matches</SectionTitle>
                    <SectionText>
                        Group standings and match results will appear here after the bracket is
                        generated.
                    </SectionText>
                </SectionCard>
            );
        }
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
            {isRoundRobin && (
                <TabsRow>
                    <TabButton
                        $active={activeTab === "groups"}
                        onClick={() => setActiveTab("groups")}
                    >
                        Group stage
                    </TabButton>
                    <TabButton
                        $active={activeTab === "knockout"}
                        onClick={() => setActiveTab("knockout")}
                    >
                        Knockout
                    </TabButton>
                </TabsRow>
            )}

            {activeTab === "groups" && (
                <>
                    <SectionTitle>Group standings</SectionTitle>
                    {groupStandings.length === 0 ? (
                        <SectionText>
                            Group standings will appear here after the round robin bracket is
                            generated.
                        </SectionText>
                    ) : (
                        <ScrollableGroupsRow>
                            {groupStandings.map((standing) => (
                                <GroupColumn
                                    key={standing.groupName}
                                    standing={standing}
                                    matches={matches}
                                    maxPlayersInGroup={maxPlayersInGroup}
                                    readOnly={readOnly}
                                    onUpdateScore={onUpdateScore}
                                    onScheduleMatch={onScheduleMatch}
                                />
                            ))}
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
                            {!readOnly ? (
                                <GenerateBracketButton onClick={onGenerateKnockout}>
                                    Generate knockout bracket
                                </GenerateBracketButton>
                            ) : (
                                <SectionText>
                                    The knockout bracket has not been generated yet.
                                </SectionText>
                            )}
                        </ActionRow>
                    ) : (
                        <SectionText>
                            Not all group stage matches are completed. Finish all matches before
                            generating the knockout bracket.
                        </SectionText>
                    )}
                </>
            )}
        </SectionCard>
    );
}

export default AdminTournamentGroupsCard;

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

const ScrollableGroupsRow = styled(Box)`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 32rem;
  padding-bottom: 0.4rem;

  &::-webkit-scrollbar {
    height: 0.45rem;
    width: 0.4rem;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }
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