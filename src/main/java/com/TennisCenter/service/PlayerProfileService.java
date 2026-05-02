package com.TennisCenter.service;

import com.TennisCenter.dto.profile.MatchHistoryResponse;
import com.TennisCenter.dto.profile.PlayerProfileResponse;
import com.TennisCenter.dto.profile.UpdateProfileRequest;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.PlayerProfile;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.PlayerProfileRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerProfileService {

    private final PlayerProfileRepository playerProfileRepository;
    private final UserRepository userRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public PlayerProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PlayerProfile profile = playerProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(user));

        int rank = calculateRank(user);

        int wins = user.getWins() == null ? 0 : user.getWins();
        int losses = user.getLosses() == null ? 0 : user.getLosses();
        int totalMatches = wins + losses;
        double winRate = totalMatches == 0 ? 0.0 : ((double) wins / totalMatches) * 100.0;

        return PlayerProfileResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getDisplayUsername())
                .email(user.getEmail())
                .playerLevel(user.getPlayerLevel() != null ? user.getPlayerLevel().getDisplayName() : "-")
                .rankingPoints(user.getRankingPoints() == null ? 0 : user.getRankingPoints())
                .wins(wins)
                .losses(losses)
                .winRate(Math.round(winRate * 10.0) / 10.0)
                .rank(rank)
                .profileImageUrl(profile.getProfileImageUrl())
                .bio(profile.getBio())
                .titlesCount(profile.getTitlesCount())
                .finalsCount(profile.getFinalsCount())
                .build();
    }

    public List<MatchHistoryResponse> getMatchHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findByPlayerOneIdOrPlayerTwoId(userId, userId);

        List<TournamentMatch> completedMatches = allMatches.stream()
                .filter(m -> m.getStatus() == TournamentMatchStatus.COMPLETED)
                .filter(m -> m.getWinner() != null)
                .sorted(Comparator.comparing(
                        (TournamentMatch m) -> {
                            if (m.getScheduledTime() != null) return m.getScheduledTime();
                            if (m.getMatchDate() != null) return m.getMatchDate().atStartOfDay();
                            return m.getTournament().getStartDate().atStartOfDay();
                        }
                ).reversed())
                .toList();

        List<MatchHistoryResponse> result = new ArrayList<>();

        for (TournamentMatch match : completedMatches) {
            User winner = match.getWinner();
            User loser = getLoser(match);

            if (winner == null || loser == null) continue;

            List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId());
            List<MatchHistoryResponse.SetScoreResponse> setScores = buildSetScores(sets, match);

            String round = resolveRoundLabel(match);

            boolean profilePlayerWon = winner.getId().equals(userId);

            result.add(MatchHistoryResponse.builder()
                    .matchId(match.getId())
                    .matchDate(match.getScheduledTime() != null
                            ? match.getScheduledTime().toLocalDate().toString()
                            : match.getMatchDate() != null
                            ? match.getMatchDate().toString()
                            : match.getTournament().getStartDate().toString())
                    .round(round)
                    .winnerName(winner.getFirstName() + " " + winner.getLastName())
                    .winnerId(winner.getId())
                    .loserName(loser.getFirstName() + " " + loser.getLastName())
                    .loserId(loser.getId())
                    .sets(setScores)
                    .profilePlayerWon(profilePlayerWon)
                    .tournamentId(match.getTournament().getId())
                    .tournamentName(match.getTournament().getName())
                    .surface(match.getTournament().getSurface() != null
                            ? match.getTournament().getSurface().getDisplayName()
                            : null)
                    .tournamentStartYear(match.getTournament().getStartDate().getYear())
                    .build());
        }

        return result;
    }

    @Transactional
    public PlayerProfileResponse updateProfile(Long userId, UpdateProfileRequest request, User currentUser) {
        if (!currentUser.getId().equals(userId)) {
            throw new RuntimeException("You can only update your own profile");
        }

        PlayerProfile profile = playerProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(currentUser));

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        playerProfileRepository.save(profile);

        return getProfile(userId);
    }

    @Transactional
    public PlayerProfileResponse uploadProfileImage(Long userId, MultipartFile image, User currentUser) {
        if (!currentUser.getId().equals(userId)) {
            throw new RuntimeException("You can only update your own profile image");
        }

        PlayerProfile profile = playerProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(currentUser));

        // Delete old image if exists
        if (profile.getProfileImageUrl() != null && !profile.getProfileImageUrl().isBlank()) {
            deleteImageIfExists(profile.getProfileImageUrl());
        }

        String imageUrl = saveImage(image);
        profile.setProfileImageUrl(imageUrl);
        playerProfileRepository.save(profile);

        return getProfile(userId);
    }

    private PlayerProfile createDefaultProfile(User user) {
        PlayerProfile profile = PlayerProfile.builder()
                .user(user)
                .titlesCount(0)
                .finalsCount(0)
                .build();
        return playerProfileRepository.save(profile);
    }

    private int calculateRank(User user) {
        if (user.getPlayerLevel() == null) return 0;

        List<User> sameLevel = userRepository.searchLeaderboardPlayers(
                Role.PLAYER,
                user.getPlayerLevel(),
                "",
                org.springframework.data.domain.PageRequest.of(
                        0, 10000,
                        Sort.by(
                                Sort.Order.desc("rankingPoints"),
                                Sort.Order.desc("wins"),
                                Sort.Order.asc("losses"),
                                Sort.Order.asc("lastName")
                        )
                )
        ).getContent();

        for (int i = 0; i < sameLevel.size(); i++) {
            if (sameLevel.get(i).getId().equals(user.getId())) {
                return i + 1;
            }
        }
        return 0;
    }

    private User getLoser(TournamentMatch match) {
        if (match.getWinner() == null) return null;
        if (match.getPlayerOne() != null && match.getPlayerOne().getId().equals(match.getWinner().getId())) {
            return match.getPlayerTwo();
        }
        return match.getPlayerOne();
    }

    private List<MatchHistoryResponse.SetScoreResponse> buildSetScores(List<MatchSet> sets, TournamentMatch match) {
        if (sets.isEmpty()) return List.of();

        User winner = match.getWinner();
        boolean playerOneIsWinner = match.getPlayerOne() != null
                && winner != null
                && match.getPlayerOne().getId().equals(winner.getId());

        List<MatchHistoryResponse.SetScoreResponse> result = new ArrayList<>();

        for (MatchSet set : sets) {
            int winnerGames;
            int loserGames;
            Integer loserTiebreak = null;

            if (playerOneIsWinner) {
                winnerGames = set.getPlayerOneGames();
                loserGames = set.getPlayerTwoGames();
                if (winnerGames == 7 && loserGames == 6 && set.getPlayerTwoTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerTwoTiebreakPoints();
                }
                if (loserGames == 7 && winnerGames == 6 && set.getPlayerOneTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerOneTiebreakPoints();
                }
            } else {
                winnerGames = set.getPlayerTwoGames();
                loserGames = set.getPlayerOneGames();
                if (winnerGames == 7 && loserGames == 6 && set.getPlayerOneTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerOneTiebreakPoints();
                }
                if (loserGames == 7 && winnerGames == 6 && set.getPlayerTwoTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerTwoTiebreakPoints();
                }
            }

            result.add(MatchHistoryResponse.SetScoreResponse.builder()
                    .winnerGames(winnerGames)
                    .loserGames(loserGames)
                    .loserTiebreakPoints(loserTiebreak)
                    .build());
        }

        return result;
    }

    private String resolveRoundLabel(TournamentMatch match) {
        if (match.getPhase() == TournamentMatchPhase.GROUP_STAGE) {
            return "Round Robin";
        }

        // Knockout phase - determine round name based on total rounds
        Integer roundNumber = match.getRoundNumber();
        if (roundNumber == null) return "Knockout";

        // Get total rounds for this tournament knockout
        List<TournamentMatch> knockoutMatches = tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(match.getTournament().getId())
                .stream()
                .filter(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT)
                .toList();

        int totalRounds = knockoutMatches.stream()
                .mapToInt(m -> m.getRoundNumber() != null ? m.getRoundNumber() : 0)
                .max()
                .orElse(1);

        int roundsFromFinal = totalRounds - roundNumber;

        return switch (roundsFromFinal) {
            case 0 -> "Final";
            case 1 -> "Semifinal";
            case 2 -> "Quarterfinal";
            case 3 -> "Round of 16";
            case 4 -> "Round of 32";
            default -> "Round " + roundNumber;
        };
    }

    private String saveImage(MultipartFile image) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save profile image");
        }
    }

    private void deleteImageIfExists(String imageUrl) {
        try {
            String fileName = imageUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Silently ignore
        }
    }
}