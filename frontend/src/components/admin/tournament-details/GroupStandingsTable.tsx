import { Box } from "@mui/material";
import styled from "styled-components";
import type { GroupStanding } from "../../../types/match";

type GroupStandingsTableProps = {
    standing: GroupStanding;
    maxPlayersInGroup: number;
};

function GroupStandingsTable({ standing, maxPlayersInGroup }: GroupStandingsTableProps) {
    return (
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
                {standing.players.map((player) => (
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
    );
}

export default GroupStandingsTable;

const StandingsArea = styled(Box)<{ $maxPlayers: number }>`
  min-height: ${({ $maxPlayers }) => `calc(1rem + ${$maxPlayers} * 3rem)`};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;

  th,
  td {
    text-align: left;
    padding: 0.6rem 0.4rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.84rem;
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