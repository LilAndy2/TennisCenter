package com.TennisCenter.service.match;

import com.TennisCenter.dto.h2h.H2HResponse.FeatureContribution;
import com.TennisCenter.dto.h2h.H2HResponse.Prediction;
import com.TennisCenter.dto.profile.CareerStatsResponse;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.service.ranking.EloService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchPredictionService {

    private final CareerStatsService careerStatsService;
    private final EloService eloService;
    private final TournamentMatchRepository tournamentMatchRepository;

    private static final String[] FEATURE_NAMES = {
            "eloDiff",
            "winRateDiff",
            "recentFormDiff",
            "firstServePctDiff",
            "firstServeWonPctDiff",
            "secondServeWonPctDiff",
            "acePerMatchDiff",
            "dfPerMatchDiff",
            "serviceGamesHeldDiff",
            "returnPointsWonDiff",
            "breakPointsConvertedDiff",
            "winnersToUeRatioDiff",
            "winnersPerMatchDiff",
            "uePerMatchDiff",
            "decidingSetWinRateDiff",
            "tiebreakWinRateDiff",
            "comebackRateDiff",
            "h2hWinRate",
    };

    private static final String[] FEATURE_DISPLAY_NAMES = {
            "Elo Rating",
            "Career Win Rate",
            "Recent Form",
            "1st Serve %",
            "1st Serve Points Won",
            "2nd Serve Points Won",
            "Aces per Match",
            "Double Faults per Match",
            "Service Games Held",
            "Return Points Won",
            "Break Points Converted",
            "Winners/UE Ratio",
            "Winners per Match",
            "Unforced Errors per Match",
            "Deciding Set Win Rate",
            "Tiebreak Win Rate",
            "Comeback Rate",
            "Head-to-Head Record",
    };

    private static final double BIAS = 0.0; // no inherent advantage
    private static final double[] WEIGHTS = {
            0.35,   // eloDiff (normalized /400)
            0.15,   // winRateDiff (normalized /100)
            0.20,   // recentFormDiff (normalized /100)
            0.08,   // firstServePctDiff (/100)
            0.10,   // firstServeWonPctDiff (/100)
            0.06,   // secondServeWonPctDiff (/100)
            0.04,   // acePerMatchDiff (/10)
            -0.06,  // dfPerMatchDiff (/10, negative = more DFs is worse)
            0.10,   // serviceGamesHeldDiff (/100)
            0.10,   // returnPointsWonDiff (/100)
            0.08,   // breakPointsConvertedDiff (/100)
            0.12,   // winnersToUeRatioDiff (/2)
            0.05,   // winnersPerMatchDiff (/20)
            -0.05,  // uePerMatchDiff (/20, negative = more UE is worse)
            0.06,   // decidingSetWinRateDiff (/100)
            0.04,   // tiebreakWinRateDiff (/100)
            0.04,   // comebackRateDiff (/100)
            0.15,   // h2hWinRate (already 0-1 scale)
    };

    private static final double[] NORMALIZERS = {
            400.0,  // eloDiff
            100.0,  // winRateDiff
            100.0,  // recentFormDiff
            100.0,  // firstServePctDiff
            100.0,  // firstServeWonPctDiff
            100.0,  // secondServeWonPctDiff
            10.0,   // acePerMatchDiff
            10.0,   // dfPerMatchDiff
            100.0,  // serviceGamesHeldDiff
            100.0,  // returnPointsWonDiff
            100.0,  // breakPointsConvertedDiff
            2.0,    // winnersToUeRatioDiff
            20.0,   // winnersPerMatchDiff
            20.0,   // uePerMatchDiff
            100.0,  // decidingSetWinRateDiff
            100.0,  // tiebreakWinRateDiff
            100.0,  // comebackRateDiff
            1.0,    // h2hWinRate (already normalized)
    };

    public Prediction predict(User playerA, User playerB) {
        CareerStatsResponse statsA = careerStatsService.getCareerStats(playerA.getId());
        CareerStatsResponse statsB = careerStatsService.getCareerStats(playerB.getId());

        double h2hRate = computeH2HRate(playerA.getId(), playerB.getId());

        double recentFormA = computeRecentForm(statsA, 5);
        double recentFormB = computeRecentForm(statsB, 5);

        double[] rawFeatures = new double[] {
                getElo(playerA) - getElo(playerB),
                statsA.getWinRate() - statsB.getWinRate(),
                recentFormA - recentFormB,
                statsA.getFirstServePercentage() - statsB.getFirstServePercentage(),
                statsA.getFirstServePointsWonPct() - statsB.getFirstServePointsWonPct(),
                statsA.getSecondServePointsWonPct() - statsB.getSecondServePointsWonPct(),
                statsA.getAcesPerMatch() - statsB.getAcesPerMatch(),
                statsA.getDoubleFaultsPerMatch() - statsB.getDoubleFaultsPerMatch(),
                statsA.getServiceGamesHeldPct() - statsB.getServiceGamesHeldPct(),
                statsA.getReturnPointsWonPct() - statsB.getReturnPointsWonPct(),
                statsA.getBreakPointsConvertedPct() - statsB.getBreakPointsConvertedPct(),
                statsA.getWinnersToUeRatio() - statsB.getWinnersToUeRatio(),
                statsA.getWinnersPerMatch() - statsB.getWinnersPerMatch(),
                statsA.getUnforcedErrorsPerMatch() - statsB.getUnforcedErrorsPerMatch(),
                statsA.getDecidingSetWinRate() - statsB.getDecidingSetWinRate(),
                statsA.getTiebreakWinRate() - statsB.getTiebreakWinRate(),
                statsA.getWinRateAfterLosingFirstSet() - statsB.getWinRateAfterLosingFirstSet(),
                h2hRate - 0.5,
        };

        double[] normalizedFeatures = new double[rawFeatures.length];
        for (int i = 0; i < rawFeatures.length; i++) {
            normalizedFeatures[i] = rawFeatures[i] / NORMALIZERS[i];
        }

        double logit = BIAS;
        double[] contributions = new double[normalizedFeatures.length];
        for (int i = 0; i < normalizedFeatures.length; i++) {
            contributions[i] = WEIGHTS[i] * normalizedFeatures[i];
            logit += contributions[i];
        }

        double probA = sigmoid(logit);
        double probB = 1.0 - probA;

        probA = Math.round(probA * 1000.0) / 10.0;
        probB = Math.round(probB * 1000.0) / 10.0;

        if (probA + probB != 100.0) {
            probB = 100.0 - probA;
        }

        List<FeatureContribution> topFeatures = new ArrayList<>();
        for (int i = 0; i < FEATURE_NAMES.length; i++) {
            double aVal = getRawValueA(i, statsA, recentFormA, h2hRate, playerA);
            double bVal = getRawValueB(i, statsB, recentFormB, h2hRate, playerB);

            topFeatures.add(FeatureContribution.builder()
                    .name(FEATURE_NAMES[i])
                    .displayName(FEATURE_DISPLAY_NAMES[i])
                    .playerAValue(round(aVal))
                    .playerBValue(round(bVal))
                    .impact(round(contributions[i] * 100))
                    .build());
        }

        topFeatures.sort((a, b) -> Double.compare(Math.abs(b.getImpact()), Math.abs(a.getImpact())));
        List<FeatureContribution> top6 = topFeatures.subList(0, Math.min(6, topFeatures.size()));

        int totalMatchesPlayed = statsA.getTotalMatches() + statsB.getTotalMatches();
        double probDiff = Math.abs(probA - probB);
        String confidence;
        if (totalMatchesPlayed < 6) {
            confidence = "LOW";
        } else if (totalMatchesPlayed < 15 || probDiff < 10) {
            confidence = "MEDIUM";
        } else {
            confidence = "HIGH";
        }

        String favouriteName = probA > probB ? playerA.getFullName() : playerB.getFullName();
        double favouriteProb = Math.max(probA, probB);
        String summary = generateSummary(playerA, playerB, probA, probB, top6, statsA, statsB, confidence);

        return Prediction.builder()
                .playerAWinProbability(probA)
                .playerBWinProbability(probB)
                .topFeatures(top6)
                .confidence(confidence)
                .summary(summary)
                .build();
    }

    private double sigmoid(double x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }

    private int getElo(User user) {
        if (user.getEloRating() != null && user.getEloRating() > 0) {
            return user.getEloRating();
        }
        return 1200;
    }

    private double computeH2HRate(Long playerAId, Long playerBId) {
        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findByPlayerOneIdOrPlayerTwoId(playerAId, playerAId);

        long h2hWins = 0;
        long h2hTotal = 0;

        for (TournamentMatch m : allMatches) {
            if (m.getStatus() != TournamentMatchStatus.COMPLETED || m.getWinner() == null) continue;
            boolean involvesB = (m.getPlayerOne() != null && m.getPlayerOne().getId().equals(playerBId))
                    || (m.getPlayerTwo() != null && m.getPlayerTwo().getId().equals(playerBId));
            if (!involvesB) continue;

            h2hTotal++;
            if (m.getWinner().getId().equals(playerAId)) h2hWins++;
        }

        if (h2hTotal == 0) return 0.5;
        return (double) h2hWins / h2hTotal;
    }

    private double computeRecentForm(CareerStatsResponse stats, int n) {
        if (stats.getMatchTrends() == null || stats.getMatchTrends().isEmpty()) {
            return stats.getWinRate();
        }

        List<CareerStatsResponse.MatchStatSnapshot> recent = stats.getMatchTrends();
        int count = Math.min(n, recent.size());
        long wins = recent.subList(0, count).stream().filter(CareerStatsResponse.MatchStatSnapshot::isWon).count();
        return (double) wins / count * 100.0;
    }

    private double getRawValueA(int featureIndex, CareerStatsResponse statsA,
                                double recentFormA, double h2hRate, User playerA) {
        return switch (featureIndex) {
            case 0 -> getElo(playerA);
            case 1 -> statsA.getWinRate();
            case 2 -> recentFormA;
            case 3 -> statsA.getFirstServePercentage();
            case 4 -> statsA.getFirstServePointsWonPct();
            case 5 -> statsA.getSecondServePointsWonPct();
            case 6 -> statsA.getAcesPerMatch();
            case 7 -> statsA.getDoubleFaultsPerMatch();
            case 8 -> statsA.getServiceGamesHeldPct();
            case 9 -> statsA.getReturnPointsWonPct();
            case 10 -> statsA.getBreakPointsConvertedPct();
            case 11 -> statsA.getWinnersToUeRatio();
            case 12 -> statsA.getWinnersPerMatch();
            case 13 -> statsA.getUnforcedErrorsPerMatch();
            case 14 -> statsA.getDecidingSetWinRate();
            case 15 -> statsA.getTiebreakWinRate();
            case 16 -> statsA.getWinRateAfterLosingFirstSet();
            case 17 -> h2hRate * 100;
            default -> 0;
        };
    }

    private double getRawValueB(int featureIndex, CareerStatsResponse statsB,
                                double recentFormB, double h2hRate, User playerB) {
        return switch (featureIndex) {
            case 0 -> getElo(playerB);
            case 1 -> statsB.getWinRate();
            case 2 -> recentFormB;
            case 3 -> statsB.getFirstServePercentage();
            case 4 -> statsB.getFirstServePointsWonPct();
            case 5 -> statsB.getSecondServePointsWonPct();
            case 6 -> statsB.getAcesPerMatch();
            case 7 -> statsB.getDoubleFaultsPerMatch();
            case 8 -> statsB.getServiceGamesHeldPct();
            case 9 -> statsB.getReturnPointsWonPct();
            case 10 -> statsB.getBreakPointsConvertedPct();
            case 11 -> statsB.getWinnersToUeRatio();
            case 12 -> statsB.getWinnersPerMatch();
            case 13 -> statsB.getUnforcedErrorsPerMatch();
            case 14 -> statsB.getDecidingSetWinRate();
            case 15 -> statsB.getTiebreakWinRate();
            case 16 -> statsB.getWinRateAfterLosingFirstSet();
            case 17 -> (1.0 - h2hRate) * 100;
            default -> 0;
        };
    }

    private String generateSummary(User playerA, User playerB,
                                   double probA, double probB,
                                   List<FeatureContribution> topFeatures,
                                   CareerStatsResponse statsA, CareerStatsResponse statsB,
                                   String confidence) {
        String favourite = probA > probB ? playerA.getFullName() : playerB.getFullName();
        String underdog = probA > probB ? playerB.getFullName() : playerA.getFullName();
        double favProb = Math.max(probA, probB);

        StringBuilder sb = new StringBuilder();

        if (favProb > 65) {
            sb.append(favourite).append(" is the clear favourite at ").append(favProb).append("%.");
        } else if (favProb > 55) {
            sb.append(favourite).append(" has a slight edge at ").append(favProb).append("%.");
        } else {
            sb.append("This is a very close matchup — essentially a coin flip.");
        }

        if (!topFeatures.isEmpty()) {
            FeatureContribution top = topFeatures.get(0);
            String beneficiary = top.getImpact() > 0 ? playerA.getFullName() : playerB.getFullName();
            sb.append(" The biggest factor is ").append(top.getDisplayName().toLowerCase())
                    .append(", which favours ").append(beneficiary).append(".");
        }

        if ("LOW".equals(confidence)) {
            sb.append(" Note: prediction confidence is low due to limited match data.");
        }

        return sb.toString();
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public int trainWeights() {
        List<TournamentMatch> allCompleted = tournamentMatchRepository.findAll().stream()
                .filter(m -> m.getStatus() == TournamentMatchStatus.COMPLETED)
                .filter(m -> m.getWinner() != null)
                .filter(m -> m.getPlayerOne() != null && m.getPlayerTwo() != null)
                .toList();

        if (allCompleted.size() < 10) {
            log.warn("Not enough matches to train ({} < 10)", allCompleted.size());
            return 0;
        }

        // Build training data
        List<double[]> featureVectors = new ArrayList<>();
        List<Double> labels = new ArrayList<>();

        // Cache career stats to avoid recomputation
        Map<Long, CareerStatsResponse> statsCache = new HashMap<>();

        for (TournamentMatch match : allCompleted) {
            User pA = match.getPlayerOne();
            User pB = match.getPlayerTwo();

            CareerStatsResponse statsA = statsCache.computeIfAbsent(pA.getId(),
                    id -> careerStatsService.getCareerStats(id));
            CareerStatsResponse statsB = statsCache.computeIfAbsent(pB.getId(),
                    id -> careerStatsService.getCareerStats(id));

            double h2hRate = computeH2HRate(pA.getId(), pB.getId());
            double recentFormA = computeRecentForm(statsA, 5);
            double recentFormB = computeRecentForm(statsB, 5);

            double[] raw = new double[] {
                    getElo(pA) - getElo(pB),
                    statsA.getWinRate() - statsB.getWinRate(),
                    recentFormA - recentFormB,
                    statsA.getFirstServePercentage() - statsB.getFirstServePercentage(),
                    statsA.getFirstServePointsWonPct() - statsB.getFirstServePointsWonPct(),
                    statsA.getSecondServePointsWonPct() - statsB.getSecondServePointsWonPct(),
                    statsA.getAcesPerMatch() - statsB.getAcesPerMatch(),
                    statsA.getDoubleFaultsPerMatch() - statsB.getDoubleFaultsPerMatch(),
                    statsA.getServiceGamesHeldPct() - statsB.getServiceGamesHeldPct(),
                    statsA.getReturnPointsWonPct() - statsB.getReturnPointsWonPct(),
                    statsA.getBreakPointsConvertedPct() - statsB.getBreakPointsConvertedPct(),
                    statsA.getWinnersToUeRatio() - statsB.getWinnersToUeRatio(),
                    statsA.getWinnersPerMatch() - statsB.getWinnersPerMatch(),
                    statsA.getUnforcedErrorsPerMatch() - statsB.getUnforcedErrorsPerMatch(),
                    statsA.getDecidingSetWinRate() - statsB.getDecidingSetWinRate(),
                    statsA.getTiebreakWinRate() - statsB.getTiebreakWinRate(),
                    statsA.getWinRateAfterLosingFirstSet() - statsB.getWinRateAfterLosingFirstSet(),
                    h2hRate - 0.5,
            };

            double[] normalized = new double[raw.length];
            for (int i = 0; i < raw.length; i++) {
                normalized[i] = raw[i] / NORMALIZERS[i];
            }

            featureVectors.add(normalized);
            labels.add(match.getWinner().getId().equals(pA.getId()) ? 1.0 : 0.0);
        }

        double learningRate = 0.1;
        int epochs = 1000;
        double[] w = Arrays.copyOf(WEIGHTS, WEIGHTS.length);
        double b = BIAS;

        int n = featureVectors.size();

        for (int epoch = 0; epoch < epochs; epoch++) {
            double[] gradW = new double[w.length];
            double gradB = 0;

            for (int i = 0; i < n; i++) {
                double[] x = featureVectors.get(i);
                double y = labels.get(i);

                double z = b;
                for (int j = 0; j < w.length; j++) {
                    z += w[j] * x[j];
                }
                double pred = sigmoid(z);
                double error = pred - y;

                gradB += error;
                for (int j = 0; j < w.length; j++) {
                    gradW[j] += error * x[j];
                }
            }

            b -= learningRate * gradB / n;
            for (int j = 0; j < w.length; j++) {
                w[j] -= learningRate * gradW[j] / n;
            }
        }

        log.info("Trained prediction model on {} matches", n);
        log.info("Learned bias: {}", round(b));
        for (int i = 0; i < w.length; i++) {
            log.info("  {} = {}", FEATURE_NAMES[i], round(w[i]));
        }

        return n;
    }
}