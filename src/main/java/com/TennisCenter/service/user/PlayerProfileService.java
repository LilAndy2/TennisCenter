package com.TennisCenter.service.user;

import com.TennisCenter.dto.profile.MatchHistoryResponse;
import com.TennisCenter.dto.profile.PlayerProfileResponse;
import com.TennisCenter.dto.profile.TitleFinalsResponse;
import com.TennisCenter.dto.profile.UpdateProfileRequest;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.PlayerProfile;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.*;
import com.TennisCenter.service.match.MatchHistoryService;
import com.TennisCenter.service.ranking.RankingService;
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
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerProfileService {

    private final PlayerProfileRepository playerProfileRepository;
    private final UserRepository userRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;
    private final RankingService rankingService;
    private final MatchHistoryService matchHistoryService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public PlayerProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PlayerProfile profile = playerProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(user));

        int rank = calculateRank(user);

        int wins = rankingService.getWins(userId);
        int losses = rankingService.getLosses(userId);
        int activePoints = rankingService.getActivePoints(userId);
        int totalMatches = wins + losses;
        double winRate = totalMatches == 0 ? 0.0 : ((double) wins / totalMatches) * 100.0;

        return PlayerProfileResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getDisplayUsername())
                .email(user.getEmail())
                .playerLevel(user.getPlayerLevel() != null ? user.getPlayerLevel().getDisplayName() : "-")
                .rankingPoints(activePoints)
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

    public List<TitleFinalsResponse> getTitlesAndFinals(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get all matches where this user participated
        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findByPlayerOneIdOrPlayerTwoId(userId, userId);

        // Find final matches (highest roundNumber in knockout phase per tournament)
        // where this player participated and the match is completed
        Map<Long, TournamentMatch> finalsByTournament = new java.util.HashMap<>();

        for (TournamentMatch match : allMatches) {
            if (match.getPhase() != TournamentMatchPhase.KNOCKOUT) continue;
            if (match.getStatus() != TournamentMatchStatus.COMPLETED) continue;
            if (match.getWinner() == null) continue;

            Long tournamentId = match.getTournament().getId();
            TournamentMatch existing = finalsByTournament.get(tournamentId);

            if (existing == null || (match.getRoundNumber() != null && existing.getRoundNumber() != null
                    && match.getRoundNumber() > existing.getRoundNumber())) {
                finalsByTournament.put(tournamentId, match);
            }
        }

        // Now verify each candidate is actually the final (highest round in tournament)
        List<TitleFinalsResponse> results = new ArrayList<>();

        for (TournamentMatch candidateFinal : finalsByTournament.values()) {
            // Check this is truly the last round of the tournament
            List<TournamentMatch> allKnockout = tournamentMatchRepository
                    .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(
                            candidateFinal.getTournament().getId())
                    .stream()
                    .filter(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT)
                    .toList();

            int maxRound = allKnockout.stream()
                    .mapToInt(m -> m.getRoundNumber() != null ? m.getRoundNumber() : 0)
                    .max()
                    .orElse(0);

            if (candidateFinal.getRoundNumber() == null
                    || candidateFinal.getRoundNumber() != maxRound) {
                continue;
            }

            User winner = candidateFinal.getWinner();
            User loser = matchHistoryService.getLoser(candidateFinal);
            if (loser == null) continue;

            boolean playerWon = winner.getId().equals(userId);
            User opponent = playerWon ? loser : winner;

            // Build score string for display
            List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(candidateFinal.getId());
            List<MatchHistoryResponse.SetScoreResponse> setScores = matchHistoryService.buildSetScores(sets, candidateFinal);
            StringBuilder scoreStr = new StringBuilder();
            for (int i = 0; i < setScores.size(); i++) {
                MatchHistoryResponse.SetScoreResponse s = setScores.get(i);
                scoreStr.append(s.getWinnerGames()).append("-").append(s.getLoserGames());
                if (s.getLoserTiebreakPoints() != null) {
                    scoreStr.append("(").append(s.getLoserTiebreakPoints()).append(")");
                }
                if (i < setScores.size() - 1) scoreStr.append(", ");
            }

            String date = candidateFinal.getScheduledTime() != null
                    ? candidateFinal.getScheduledTime().toLocalDate().toString()
                    : candidateFinal.getMatchDate() != null
                    ? candidateFinal.getMatchDate().toString()
                    : candidateFinal.getTournament().getStartDate().toString();

            results.add(TitleFinalsResponse.builder()
                    .tournamentId(candidateFinal.getTournament().getId())
                    .tournamentName(candidateFinal.getTournament().getName())
                    .surface(candidateFinal.getTournament().getSurface() != null
                            ? candidateFinal.getTournament().getSurface().getDisplayName()
                            : null)
                    .tournamentLevel(candidateFinal.getTournament().getLevel() != null
                            ? candidateFinal.getTournament().getLevel().getDisplayName()
                            : null)
                    .date(date)
                    .opponentName(opponent.getFullName())
                    .opponentId(opponent.getId())
                    .result(scoreStr.toString())
                    .won(playerWon)
                    .build());
        }

        // Sort by date descending
        results.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        return results;
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