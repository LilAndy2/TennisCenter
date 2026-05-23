package com.TennisCenter.service.ranking;

import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EloService {

    private final UserRepository userRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;

    private static final int DEFAULT_ELO = 1200;
    private static final int K_NEW = 32;       // first 20 matches
    private static final int K_ESTABLISHED = 24; // after 20 matches
    private static final int PROVISIONAL_THRESHOLD = 20;

    private static final Map<PlayerLevel, Integer> LEVEL_STARTING_ELO = Map.of(
            PlayerLevel.ENTRY, 1000,
            PlayerLevel.STARTER, 1150,
            PlayerLevel.MEDIUM, 1300,
            PlayerLevel.MASTER, 1450,
            PlayerLevel.EXPERT, 1600,
            PlayerLevel.STELLAR, 1750
    );

    @Transactional
    public void updateEloAfterMatch(TournamentMatch match) {
        if (match.getWinner() == null || match.getPlayerOne() == null || match.getPlayerTwo() == null) {
            return;
        }

        User winner = match.getWinner();
        User loser = match.getPlayerOne().getId().equals(winner.getId())
                ? match.getPlayerTwo()
                : match.getPlayerOne();

        int winnerElo = getElo(winner);
        int loserElo = getElo(loser);

        int winnerMatches = getTotalMatches(winner);
        int loserMatches = getTotalMatches(loser);

        double marginMultiplier = computeMarginMultiplier(match);

        int kWinner = winnerMatches < PROVISIONAL_THRESHOLD ? K_NEW : K_ESTABLISHED;
        int kLoser = loserMatches < PROVISIONAL_THRESHOLD ? K_NEW : K_ESTABLISHED;

        double expectedWinner = expectedScore(winnerElo, loserElo);
        double expectedLoser = 1.0 - expectedWinner;

        int winnerChange = (int) Math.round(kWinner * marginMultiplier * (1.0 - expectedWinner));
        int loserChange = (int) Math.round(kLoser * marginMultiplier * (0.0 - expectedLoser));

        if (winnerChange == 0) winnerChange = 1;
        if (loserChange == 0) loserChange = -1;

        winner.setEloRating(winnerElo + winnerChange);
        loser.setEloRating(loserElo + loserChange);

        if (winner.getEloRating() < 100) winner.setEloRating(100);
        if (loser.getEloRating() < 100) loser.setEloRating(100);

        userRepository.save(winner);
        userRepository.save(loser);

        log.debug("Elo update: {} {} → {} ({}{}), {} {} → {} ({}{})",
                winner.getFullName(), winnerElo, winner.getEloRating(),
                winnerChange >= 0 ? "+" : "", winnerChange,
                loser.getFullName(), loserElo, loser.getEloRating(),
                loserChange >= 0 ? "+" : "", loserChange);
    }

    /**
     * Compute the expected score (win probability) for player A vs player B.
     * Returns a value between 0.0 and 1.0.
     */
    public double expectedScore(int eloA, int eloB) {
        return 1.0 / (1.0 + Math.pow(10.0, (eloB - eloA) / 400.0));
    }

    /**
     * Replay all completed matches chronologically and rebuild Elo ratings from scratch.
     * Used for initial seeding and recalibration.
     */
    @Transactional
    public int replayAllMatches() {
        List<User> allPlayers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(Role.PLAYER))
                .toList();

        for (User player : allPlayers) {
            int startingElo = LEVEL_STARTING_ELO.getOrDefault(player.getPlayerLevel(), DEFAULT_ELO);
            player.setEloRating(startingElo);
            userRepository.save(player);
        }

        List<TournamentMatch> completedMatches = tournamentMatchRepository.findAll().stream()
                .filter(m -> m.getStatus() == TournamentMatchStatus.COMPLETED)
                .filter(m -> m.getWinner() != null)
                .filter(m -> m.getPlayerOne() != null && m.getPlayerTwo() != null)
                .sorted(Comparator.comparing(m -> {
                    if (m.getCompletedAt() != null) return m.getCompletedAt().toLocalDate();
                    if (m.getScheduledTime() != null) return m.getScheduledTime().toLocalDate();
                    if (m.getMatchDate() != null) return m.getMatchDate();
                    return m.getTournament().getStartDate();
                }))
                .toList();

        int count = 0;
        for (TournamentMatch match : completedMatches) {
            match.setPlayerOne(userRepository.findById(match.getPlayerOne().getId()).orElse(match.getPlayerOne()));
            match.setPlayerTwo(userRepository.findById(match.getPlayerTwo().getId()).orElse(match.getPlayerTwo()));
            match.setWinner(userRepository.findById(match.getWinner().getId()).orElse(match.getWinner()));

            updateEloAfterMatch(match);
            count++;
        }

        log.info("Elo replay complete: {} matches processed", count);
        return count;
    }

    public Page<EloLeaderboardEntry> getEloLeaderboard(String search, int page, int size) {
        List<User> allPlayers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(Role.PLAYER))
                .filter(u -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.trim().toLowerCase();
                    return u.getFullName().toLowerCase().contains(q)
                            || u.getDisplayUsername().toLowerCase().contains(q);
                })
                .sorted(Comparator.comparingInt(u -> -getElo((User) u)))
                .toList();

        int start = page * size;
        int end = Math.min(start + size, allPlayers.size());

        List<EloLeaderboardEntry> entries = new ArrayList<>();
        for (int i = start; i < end; i++) {
            User u = allPlayers.get(i);
            int wins = u.getWins() == null ? 0 : u.getWins();
            int losses = u.getLosses() == null ? 0 : u.getLosses();
            int total = wins + losses;
            double winRate = total > 0 ? Math.round(((double) wins / total) * 1000.0) / 10.0 : 0;

            entries.add(EloLeaderboardEntry.builder()
                    .id(u.getId())
                    .rank(i + 1)
                    .fullName(u.getFullName())
                    .level(u.getPlayerLevel() != null ? u.getPlayerLevel().getDisplayName() : "-")
                    .eloRating(getElo(u))
                    .wins(wins)
                    .losses(losses)
                    .winRate(winRate)
                    .build());
        }

        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(entries, pageable, allPlayers.size());
    }

    private int getElo(User user) {
        if (user.getEloRating() != null && user.getEloRating() > 0) {
            return user.getEloRating();
        }
        return LEVEL_STARTING_ELO.getOrDefault(user.getPlayerLevel(), DEFAULT_ELO);
    }

    private int getTotalMatches(User user) {
        int wins = user.getWins() == null ? 0 : user.getWins();
        int losses = user.getLosses() == null ? 0 : user.getLosses();
        return wins + losses;
    }

    /**
     * Compute the score margin multiplier based on the game differential.
     * A dominant win (e.g. 6-0 6-1) produces a multiplier around 1.3–1.5.
     * A tight win (e.g. 7-6 6-7 7-6) stays near 1.0.
     */
    private double computeMarginMultiplier(TournamentMatch match) {
        List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId());
        if (sets.isEmpty()) return 1.0;

        boolean winnerIsP1 = match.getWinner().getId().equals(match.getPlayerOne().getId());

        int winnerGames = 0;
        int loserGames = 0;
        for (MatchSet s : sets) {
            if (winnerIsP1) {
                winnerGames += s.getPlayerOneGames();
                loserGames += s.getPlayerTwoGames();
            } else {
                winnerGames += s.getPlayerTwoGames();
                loserGames += s.getPlayerOneGames();
            }
        }

        int totalGames = winnerGames + loserGames;
        if (totalGames == 0) return 1.0;

        double gameDiff = (double) (winnerGames - loserGames) / totalGames;
        return 1.0 + gameDiff * 0.5;
    }

    @lombok.Data
    @lombok.Builder
    public static class EloLeaderboardEntry {
        private Long id;
        private int rank;
        private String fullName;
        private String level;
        private int eloRating;
        private int wins;
        private int losses;
        private double winRate;
    }
}