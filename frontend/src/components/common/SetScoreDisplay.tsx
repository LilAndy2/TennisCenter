import { Box } from "@mui/material";
import styled from "styled-components";
import { fontSize, fontWeight, colors } from "../../styles/theme";

type SetScore = {
    winnerGames: number;
    loserGames: number;
    loserTiebreakPoints?: number | null;
};

type SetScoreDisplayProps = {
    sets: SetScore[];
    emptyLabel?: string;
};

function SetScoreDisplay({ sets, emptyLabel = "—" }: SetScoreDisplayProps) {
    if (sets.length === 0) {
        return <ScoreText>{emptyLabel}</ScoreText>;
    }

    return (
        <ScoreText>
            {sets.map((set, idx) => (
                <SetChunk key={idx}>
                    <SetScoreWrapper>
                        {set.winnerGames}-{set.loserGames}
                        {set.loserTiebreakPoints != null && (
                            <TiebreakSuperscript>
                                {set.loserTiebreakPoints}
                            </TiebreakSuperscript>
                        )}
                    </SetScoreWrapper>
                    {idx < sets.length - 1 && <SetSeparator>/</SetSeparator>}
                </SetChunk>
            ))}
        </ScoreText>
    );
}

export default SetScoreDisplay;

const ScoreText = styled(Box)`
    display: inline-flex;
    align-items: baseline;
    gap: 0.15rem;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    color: ${colors.textPrimary};
    font-variant-numeric: tabular-nums;
`;

const SetChunk = styled.span`
    display: inline-flex;
    align-items: baseline;
    gap: 0.15rem;
`;

const SetScoreWrapper = styled.span`
    position: relative;
`;

const TiebreakSuperscript = styled.sup`
    font-size: 0.6em;
    font-weight: 700;
    color: ${colors.textMuted};
    position: relative;
    top: -0.35em;
    margin-left: 0.05rem;
`;

const SetSeparator = styled.span`
    color: ${colors.textHint};
    margin: 0 0.1rem;
    font-weight: 500;
`;