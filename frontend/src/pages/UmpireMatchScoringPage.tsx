import { ArrowBack, SportsTennis, Undo } from "@mui/icons-material";
import { Box, CircularProgress, Snackbar, Alert, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../styles/theme";
import type { LiveScoreState, RecordPointPayload } from "../types/liveScoring";

function UmpireMatchScoringPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();

    const [score, setScore] = useState<LiveScoreState | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState<{
        message: string;
        severity: "success" | "error" | "info";
    } | null>(null);

    const [serveType, setServeType] = useState<"FIRST_SERVE" | "SECOND_SERVE">("FIRST_SERVE");
    const [selectingFirstServer, setSelectingFirstServer] = useState(false);

    const loadScore = useCallback(async () => {
        try {
            const res = await axiosInstance.get<LiveScoreState>(
                `/umpire/matches/${matchId}/live-score`
            );
            setScore(res.data);
            if (res.data.totalPoints === 0 && !res.data.matchFinished) {
                setSelectingFirstServer(true);
            }
        } catch {
            setError("Failed to load match score");
        } finally {
            setLoading(false);
        }
    }, [matchId]);

    useEffect(() => {
        loadScore();
    }, [loadScore]);

    const handleSetFirstServer = async (serverId: number) => {
        try {
            const res = await axiosInstance.post<LiveScoreState>(
                `/umpire/matches/${matchId}/first-server?serverId=${serverId}`
            );
            setScore(res.data);
            setSelectingFirstServer(false);
        } catch {
            setToast({ message: "Failed to set first server", severity: "error" });
        }
    };

    // ─── One-tap point recording ───
    const recordPoint = async (
        pointWinnerId: number | null,
        outcome: RecordPointPayload["pointOutcome"],
        shotType: RecordPointPayload["shotType"]
    ) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await axiosInstance.post<LiveScoreState>(
                `/umpire/matches/${matchId}/points`,
                {
                    pointWinnerId,
                    serveType,
                    pointOutcome: outcome,
                    shotType,
                } as RecordPointPayload
            );
            setScore(res.data);
            // Reset to 1st serve after each point
            setServeType("FIRST_SERVE");
            if (res.data.matchFinished) {
                setToast({ message: "Match complete!", severity: "success" });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to record point";
            setToast({ message: msg, severity: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUndo = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await axiosInstance.delete<LiveScoreState>(
                `/umpire/matches/${matchId}/points/last`
            );
            setScore(res.data);
            setToast({ message: "Last point undone", severity: "info" });
        } catch {
            setToast({ message: "Nothing to undo", severity: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Loading / Error states ───
    if (loading) {
        return (
            <AnimatedPage>
                <AuthenticatedLayout>
                    <PageWrapper>
                        <LoadingBox><CircularProgress /></LoadingBox>
                    </PageWrapper>
                </AuthenticatedLayout>
            </AnimatedPage>
        );
    }

    if (error || !score) {
        return (
            <AnimatedPage>
                <AuthenticatedLayout>
                    <PageWrapper>
                        <ErrorCard>{error || "Match not found"}</ErrorCard>
                        <BackLink onClick={() => navigate("/umpire/live-scoring")}>
                            <ArrowBack sx={{ fontSize: 16 }} /> Back to matches
                        </BackLink>
                    </PageWrapper>
                </AuthenticatedLayout>
            </AnimatedPage>
        );
    }

    // ─── Derived state ───
    const p1Serving = score.serverId === score.playerOneId;
    const gameParts = score.currentGameScore.split("-");
    const p1GamePts = gameParts[0] || "0";
    const p2GamePts = gameParts[1] || "0";

    const p1Short = score.playerOneName.split(" ")[0];
    const p2Short = score.playerTwoName.split(" ")[0];

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    {/* ─── Top Bar ─── */}
                    <TopBar>
                        <BackLink onClick={() => navigate("/umpire/live-scoring")}>
                            <ArrowBack sx={{ fontSize: 16 }} /> Back
                        </BackLink>
                        {score.totalPoints > 0 && !score.matchFinished && (
                            <UndoButton onClick={handleUndo} disabled={submitting}>
                                <Undo sx={{ fontSize: 18 }} />
                                Undo
                            </UndoButton>
                        )}
                    </TopBar>

                    {/* ─── Scoreboard ─── */}
                    <ScoreboardCard>
                        <ScoreboardInner>
                            <PlayerScoreRow>
                                <PlayerCol>
                                    {p1Serving && <ServeDot />}
                                    <ScorePlayerName $serving={p1Serving}>
                                        {score.playerOneName}
                                    </ScorePlayerName>
                                </PlayerCol>
                                <ScoreNumbers>
                                    {score.sets.map((s) => (
                                        <CompletedSetCell key={s.setNumber}>
                                            {s.playerOneGames}
                                        </CompletedSetCell>
                                    ))}
                                    <CurrentSetCell>
                                        {score.currentSetPlayerOneGames}
                                    </CurrentSetCell>
                                    <PointCell>
                                        {score.inTiebreak
                                            ? (score.tiebreakPlayerOnePoints ?? 0)
                                            : p1GamePts}
                                    </PointCell>
                                </ScoreNumbers>
                            </PlayerScoreRow>

                            <ScoreDivider />

                            <PlayerScoreRow>
                                <PlayerCol>
                                    {!p1Serving && <ServeDot />}
                                    <ScorePlayerName $serving={!p1Serving}>
                                        {score.playerTwoName}
                                    </ScorePlayerName>
                                </PlayerCol>
                                <ScoreNumbers>
                                    {score.sets.map((s) => (
                                        <CompletedSetCell key={s.setNumber}>
                                            {s.playerTwoGames}
                                        </CompletedSetCell>
                                    ))}
                                    <CurrentSetCell>
                                        {score.currentSetPlayerTwoGames}
                                    </CurrentSetCell>
                                    <PointCell>
                                        {score.inTiebreak
                                            ? (score.tiebreakPlayerTwoPoints ?? 0)
                                            : p2GamePts}
                                    </PointCell>
                                </ScoreNumbers>
                            </PlayerScoreRow>
                        </ScoreboardInner>

                        {score.inTiebreak && <TiebreakTag>Tiebreak</TiebreakTag>}
                    </ScoreboardCard>

                    {/* ─── Match Finished ─── */}
                    {score.matchFinished && (
                        <FinishedBanner>
                            <SportsTennis sx={{ fontSize: 22 }} />
                            <span>Match Complete</span>
                            <FinishedLink onClick={() => navigate("/umpire/live-scoring")}>
                                Back to My Matches
                            </FinishedLink>
                        </FinishedBanner>
                    )}

                    {/* ─── First Server Selection ─── */}
                    {selectingFirstServer && (
                        <FirstServerCard>
                            <FSTitle>Who serves first?</FSTitle>
                            <FSButtons>
                                <FSButton onClick={() => handleSetFirstServer(score.playerOneId)}>
                                    {score.playerOneName}
                                </FSButton>
                                <FSButton onClick={() => handleSetFirstServer(score.playerTwoId)}>
                                    {score.playerTwoName}
                                </FSButton>
                            </FSButtons>
                        </FirstServerCard>
                    )}

                    {/* ─── Controls ─── */}
                    {!selectingFirstServer && !score.matchFinished && (
                        <ControlsCard>
                            {/* Serve Toggle */}
                            <ServeRow>
                                <ServeLabel>Serve:</ServeLabel>
                                <ServeToggle>
                                    <ServeOption
                                        $active={serveType === "FIRST_SERVE"}
                                        onClick={() => setServeType("FIRST_SERVE")}
                                    >
                                        1st
                                    </ServeOption>
                                    <ServeOption
                                        $active={serveType === "SECOND_SERVE"}
                                        onClick={() => setServeType("SECOND_SERVE")}
                                    >
                                        2nd
                                    </ServeOption>
                                </ServeToggle>
                            </ServeRow>

                            {/* Column Headers */}
                            <ColumnHeaders>
                                <ColHeader $serving={p1Serving}>
                                    {p1Serving && "● "}{p1Short}
                                </ColHeader>
                                <ColHeaderCenter />
                                <ColHeader $serving={!p1Serving}>
                                    {!p1Serving && "● "}{p2Short}
                                </ColHeader>
                            </ColumnHeaders>

                            {/* Ace */}
                            <BtnRow>
                                <PointBtn $v="ace" disabled={submitting}
                                          onClick={() => recordPoint(null, "ACE", null)}>
                                    Ace
                                </PointBtn>
                                <RowLabel $v="ace">Ace</RowLabel>
                                <PointBtn $v="ace" disabled={submitting}
                                          onClick={() => recordPoint(null, "ACE", null)}>
                                    Ace
                                </PointBtn>
                            </BtnRow>

                            {/* Double Fault */}
                            <BtnRow>
                                <PointBtn $v="fault" disabled={submitting}
                                          onClick={() => recordPoint(null, "DOUBLE_FAULT", null)}>
                                    Double Fault
                                </PointBtn>
                                <RowLabel $v="fault">Dbl Fault</RowLabel>
                                <PointBtn $v="fault" disabled={submitting}
                                          onClick={() => recordPoint(null, "DOUBLE_FAULT", null)}>
                                    Double Fault
                                </PointBtn>
                            </BtnRow>

                            <Divider />

                            {/* FH Winner */}
                            <BtnRow>
                                <PointBtn $v="winner" disabled={submitting}
                                          onClick={() => recordPoint(score.playerOneId, "WINNER", "FOREHAND")}>
                                    FH Winner
                                </PointBtn>
                                <RowLabel $v="winner">FH Winner</RowLabel>
                                <PointBtn $v="winner" disabled={submitting}
                                          onClick={() => recordPoint(score.playerTwoId, "WINNER", "FOREHAND")}>
                                    FH Winner
                                </PointBtn>
                            </BtnRow>

                            {/* BH Winner */}
                            <BtnRow>
                                <PointBtn $v="winner" disabled={submitting}
                                          onClick={() => recordPoint(score.playerOneId, "WINNER", "BACKHAND")}>
                                    BH Winner
                                </PointBtn>
                                <RowLabel $v="winner">BH Winner</RowLabel>
                                <PointBtn $v="winner" disabled={submitting}
                                          onClick={() => recordPoint(score.playerTwoId, "WINNER", "BACKHAND")}>
                                    BH Winner
                                </PointBtn>
                            </BtnRow>

                            {/* Volley / Net Winner */}
                            <BtnRow>
                                <PointBtn $v="net" disabled={submitting}
                                          onClick={() => recordPoint(score.playerOneId, "WINNER", "VOLLEY")}>
                                    Net Winner
                                </PointBtn>
                                <RowLabel $v="net">Net</RowLabel>
                                <PointBtn $v="net" disabled={submitting}
                                          onClick={() => recordPoint(score.playerTwoId, "WINNER", "VOLLEY")}>
                                    Net Winner
                                </PointBtn>
                            </BtnRow>

                            <Divider />

                            {/* FH Unforced Error — note: the player column is who made the error, so opponent wins */}
                            <BtnRow>
                                <PointBtn $v="error" disabled={submitting}
                                          onClick={() => recordPoint(score.playerTwoId, "UNFORCED_ERROR", "FOREHAND")}>
                                    FH UE
                                </PointBtn>
                                <RowLabel $v="error">FH Unf. Err</RowLabel>
                                <PointBtn $v="error" disabled={submitting}
                                          onClick={() => recordPoint(score.playerOneId, "UNFORCED_ERROR", "FOREHAND")}>
                                    FH UE
                                </PointBtn>
                            </BtnRow>

                            {/* BH Unforced Error */}
                            <BtnRow>
                                <PointBtn $v="error" disabled={submitting}
                                          onClick={() => recordPoint(score.playerTwoId, "UNFORCED_ERROR", "BACKHAND")}>
                                    BH UE
                                </PointBtn>
                                <RowLabel $v="error">BH Unf. Err</RowLabel>
                                <PointBtn $v="error" disabled={submitting}
                                          onClick={() => recordPoint(score.playerOneId, "UNFORCED_ERROR", "BACKHAND")}>
                                    BH UE
                                </PointBtn>
                            </BtnRow>

                            {/* Forced Error */}
                            <BtnRow>
                                <PointBtn $v="forced" disabled={submitting}
                                          onClick={() => recordPoint(score.playerTwoId, "FORCED_ERROR", "FOREHAND")}>
                                    Forced Err
                                </PointBtn>
                                <RowLabel $v="forced">Forced Err</RowLabel>
                                <PointBtn $v="forced" disabled={submitting}
                                          onClick={() => recordPoint(score.playerOneId, "FORCED_ERROR", "FOREHAND")}>
                                    Forced Err
                                </PointBtn>
                            </BtnRow>

                            <Divider />

                            {/* Point Won (generic) */}
                            <BtnRow>
                                <PointBtn $v="pointwon" disabled={submitting}
                                          onClick={() => recordPoint(score.playerOneId, "POINT_WON", null)}>
                                    Point Won
                                </PointBtn>
                                <RowLabel $v="pointwon">Point Won</RowLabel>
                                <PointBtn $v="pointwon" disabled={submitting}
                                          onClick={() => recordPoint(score.playerTwoId, "POINT_WON", null)}>
                                    Point Won
                                </PointBtn>
                            </BtnRow>
                        </ControlsCard>
                    )}

                    {/* Toast */}
                    <Snackbar
                        open={!!toast}
                        autoHideDuration={3000}
                        onClose={() => setToast(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    >
                        {toast ? (
                            <Alert
                                severity={toast.severity}
                                onClose={() => setToast(null)}
                                variant="filled"
                            >
                                {toast.message}
                            </Alert>
                        ) : undefined}
                    </Snackbar>
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default UmpireMatchScoringPage;

// ─── Animations ───

const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
    50% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); }
`;

// ─── Layout ───

const PageWrapper = styled(Box)`
    max-width: 36rem;
    margin: 0 auto;
    padding: ${spacing.sm} ${spacing.sm} 5rem;
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
`;

const LoadingBox = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xxl};
`;

const ErrorCard = styled(Box)`
    background: ${colors.dangerBg};
    color: ${colors.danger};
    padding: ${spacing.lg};
    border-radius: ${radius.lg};
    font-weight: ${fontWeight.bold};
    text-align: center;
`;

// ─── Top Bar ───

const TopBar = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const BackLink = styled(Box)`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    color: ${colors.textMuted};
    cursor: pointer;
    transition: color ${transition.fast};
    &:hover { color: ${colors.primary}; }
`;

const UndoButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.85rem;
    border: 1.5px solid ${colors.border};
    border-radius: ${radius.pill};
    background: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    color: ${colors.textSecondary};
    cursor: pointer;
    transition: all ${transition.fast};
    &:hover {
        border-color: ${colors.warning};
        color: ${colors.warning};
        background: ${colors.warningBg};
    }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ─── Scoreboard ───

const ScoreboardCard = styled(Box)`
    background: linear-gradient(145deg, #064e3b, #065f46);
    border-radius: ${radius.xl};
    padding: 0.8rem 1rem;
    box-shadow: ${shadow.lg};
    position: relative;
    overflow: hidden;
`;

const ScoreboardInner = styled(Box)`
    position: relative;
    z-index: 1;
`;

const PlayerScoreRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.35rem 0;
`;

const PlayerCol = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
    min-width: 0;
`;

const ServeDot = styled(Box)`
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #fbbf24;
    flex-shrink: 0;
    animation: ${pulseGlow} 2s ease-in-out infinite;
`;

const ScorePlayerName = styled(Typography)<{ $serving: boolean }>`
    font-size: 0.9rem !important;
    font-weight: ${({ $serving }) => ($serving ? 800 : 500)} !important;
    color: ${({ $serving }) => ($serving ? "white" : "rgba(255,255,255,0.6)")} !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ScoreNumbers = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.2rem;
`;

const CompletedSetCell = styled(Box)`
    width: 1.4rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${fontSize.sm};
    font-weight: 800;
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.06);
    border-radius: 3px;
    font-variant-numeric: tabular-nums;
`;

const CurrentSetCell = styled(Box)`
    width: 1.4rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${fontSize.sm};
    font-weight: 800;
    color: #fbbf24;
    background: rgba(251,191,36,0.1);
    border-radius: 3px;
    font-variant-numeric: tabular-nums;
`;

const PointCell = styled(Box)`
    width: 2.1rem;
    height: 1.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 900;
    color: white;
    background: rgba(16,185,129,0.2);
    border: 1px solid rgba(16,185,129,0.3);
    border-radius: 4px;
    margin-left: 0.25rem;
    font-variant-numeric: tabular-nums;
`;

const ScoreDivider = styled(Box)`
    height: 1px;
    background: rgba(255,255,255,0.08);
`;

const TiebreakTag = styled(Box)`
    position: absolute;
    top: 0.35rem;
    right: 0.55rem;
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #fbbf24;
    background: rgba(251,191,36,0.1);
    padding: 0.1rem 0.4rem;
    border-radius: ${radius.pill};
    z-index: 2;
`;

// ─── Finished ───

const FinishedBanner = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${spacing.sm};
    flex-wrap: wrap;
    padding: 0.9rem;
    background: #ecfdf5;
    border: 1.5px solid #a7f3d0;
    border-radius: ${radius.lg};
    color: #065f46;
    font-size: ${fontSize.sm};
    font-weight: 800;
`;

const FinishedLink = styled.span`
    color: ${colors.primary};
    text-decoration: underline;
    cursor: pointer;
    font-weight: 700;
    &:hover { color: ${colors.primaryHover}; }
`;

// ─── First Server ───

const FirstServerCard = styled(Box)`
    background: white;
    border: 1.5px solid ${colors.borderGreen};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    text-align: center;
    box-shadow: ${shadow.sm};
`;

const FSTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: 800 !important;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.md} !important;
`;

const FSButtons = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing.sm};
`;

const FSButton = styled.button`
    padding: 1rem;
    border-radius: ${radius.md};
    border: 2px solid ${colors.primary};
    background: ${colors.primaryLighter};
    color: ${colors.primaryDark};
    font-size: ${fontSize.sm};
    font-weight: 700;
    cursor: pointer;
    transition: all ${transition.fast};
    &:hover { background: ${colors.primary}; color: white; }
    &:active { transform: scale(0.97); }
`;

// ─── Controls Card ───

const ControlsCard = styled(Box)`
    background: white;
    border: 1.5px solid ${colors.borderGreen};
    border-radius: ${radius.xl};
    padding: ${spacing.md};
    box-shadow: ${shadow.sm};
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

// ─── Serve Toggle ───

const ServeRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    margin-bottom: 0.2rem;
`;

const ServeLabel = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: 700 !important;
    color: ${colors.textSecondary};
`;

const ServeToggle = styled(Box)`
    display: flex;
    border: 1.5px solid ${colors.border};
    border-radius: ${radius.pill};
    overflow: hidden;
`;

const ServeOption = styled.button<{ $active: boolean }>`
    padding: 0.3rem 0.9rem;
    border: none;
    font-size: ${fontSize.sm};
    font-weight: 700;
    cursor: pointer;
    transition: all ${transition.fast};
    background: ${({ $active }) => ($active ? colors.primary : "white")};
    color: ${({ $active }) => ($active ? "white" : colors.textMuted)};
    &:hover {
        background: ${({ $active }) => ($active ? colors.primaryHover : colors.surfaceAlt)};
    }
`;

// ─── Column Headers ───

const ColumnHeaders = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 5.5rem 1fr;
    gap: 0.4rem;
    align-items: end;
    margin-bottom: 0.15rem;
`;

const ColHeader = styled(Box)<{ $serving?: boolean }>`
    text-align: center;
    font-size: ${fontSize.xs};
    font-weight: 800;
    color: ${({ $serving }) => ($serving ? colors.primaryDark : colors.textMuted)};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding-bottom: 0.3rem;
    border-bottom: 2px solid ${({ $serving }) => ($serving ? colors.primary : colors.border)};
`;

const ColHeaderCenter = styled(Box)`
    border-bottom: 2px solid ${colors.borderLight};
    height: 100%;
`;

// ─── Button Rows ───

const BtnRow = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 5.5rem 1fr;
    gap: 0.4rem;
    align-items: center;
`;

type V = "ace" | "fault" | "winner" | "net" | "error" | "forced" | "pointwon";

const RowLabel = styled(Box)<{ $v: V }>`
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    text-align: center;
    white-space: nowrap;
    color: ${({ $v }) => {
        const map: Record<V, string> = {
            ace: "#047857", fault: "#b91c1c", winner: "#15803d",
            net: "#0f766e", error: "#166534", forced: "#065f46",
            pointwon: colors.textMuted,
        };
    return map[$v];
}};
`;

const Divider = styled(Box)`
    height: 1px;
    background: ${colors.borderLight};
    margin: 0.1rem 0;
`;

const vs: Record<V, { bg: string; border: string; color: string; hover: string }> = {
    ace:      { bg: "#ecfdf5", border: "#a7f3d0", color: "#047857", hover: "#047857" },
    fault:    { bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c", hover: "#b91c1c" },
    winner:   { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", hover: "#15803d" },
    net:      { bg: "#ecfdf5", border: "#99f6e4", color: "#0f766e", hover: "#0f766e" },
    error:    { bg: "#f0fdf4", border: "#a7f3d0", color: "#166534", hover: "#166534" },
    forced:   { bg: "#ecfdf5", border: "#a7f3d0", color: "#065f46", hover: "#065f46" },
    pointwon: { bg: "#f8fafc", border: "#e2e8f0", color: "#475569", hover: "#475569" },
};

const PointBtn = styled.button<{ $v: V }>`
    padding: 0.7rem 0.3rem;
    border-radius: ${radius.md};
    font-size: ${fontSize.xs};
    font-weight: 700;
    cursor: pointer;
    transition: all ${transition.fast};
    border: 1.5px solid ${({ $v }) => vs[$v].border};
    background: ${({ $v }) => vs[$v].bg};
    color: ${({ $v }) => vs[$v].color};

    &:hover {
        background: ${({ $v }) => vs[$v].hover};
        color: white;
    }
    &:active { transform: scale(0.95); }
    &:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
`;