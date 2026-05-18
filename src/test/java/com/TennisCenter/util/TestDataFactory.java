package com.TennisCenter.util;

import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TestDataFactory {

    public static User player() {
        return player(1L, "john", "john@test.com");
    }

    public static User player(Long id, String username, String email) {
        return User.builder()
                .id(id)
                .firstName("John")
                .lastName("Doe")
                .username(username)
                .email(email)
                .password("encodedPassword")
                .role(Role.PLAYER)
                .playerLevel(PlayerLevel.MEDIUM)
                .rankingPoints(0)
                .wins(0)
                .losses(0)
                .build();
    }

    public static User admin() {
        return admin(99L);
    }

    public static User admin(Long id) {
        return User.builder()
                .id(id)
                .firstName("Admin")
                .lastName("User")
                .username("admin")
                .email("admin@test.com")
                .password("encodedPassword")
                .role(Role.ADMIN)
                .playerLevel(null)
                .rankingPoints(0)
                .wins(0)
                .losses(0)
                .build();
    }

    public static Tournament tournament() {
        return tournament(1L, "Spring Open", TournamentStatus.UPCOMING);
    }

    public static Tournament tournament(Long id, String name, TournamentStatus status) {
        return Tournament.builder()
                .id(id)
                .name(name)
                .level(TournamentLevel.MEDIUM)
                .status(status)
                .surface(TournamentSurface.HARD)
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusDays(14))
                .maxPlayers(16)
                .description("Test tournament")
                .isFull(false)
                .bracketType(TournamentBracketType.SINGLE_ELIMINATION)
                .build();
    }

    public static TournamentMatch match(Tournament tournament, User p1, User p2) {
        return TournamentMatch.builder()
                .id(1L)
                .tournament(tournament)
                .playerOne(p1)
                .playerTwo(p2)
                .phase(TournamentMatchPhase.KNOCKOUT)
                .status(TournamentMatchStatus.SCHEDULED)
                .roundNumber(1)
                .matchOrder(1)
                .build();
    }

    public static TournamentMatch completedMatch(Tournament tournament, User p1, User p2, User winner) {
        TournamentMatch m = match(tournament, p1, p2);
        m.setStatus(TournamentMatchStatus.COMPLETED);
        m.setWinner(winner);
        m.setMatchDate(LocalDate.now());
        return m;
    }

    public static MatchSet matchSet(TournamentMatch match, int setNumber, int p1Games, int p2Games) {
        return MatchSet.builder()
                .id((long) setNumber)
                .match(match)
                .setNumber(setNumber)
                .playerOneGames(p1Games)
                .playerTwoGames(p2Games)
                .build();
    }

    public static RankingPoint rankingPoint(User user, TournamentMatch match, boolean win) {
        return RankingPoint.builder()
                .id(1L)
                .user(user)
                .match(match)
                .points(win ? 100 : 25)
                .awardedDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .win(win)
                .build();
    }

    public static FeedPost feedPost(User author) {
        return FeedPost.builder()
                .id(1L)
                .content("Test post content")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .author(author)
                .build();
    }

    public static Comment comment(FeedPost post, User author) {
        return Comment.builder()
                .id(1L)
                .content("Test comment")
                .createdAt(LocalDateTime.now())
                .author(author)
                .post(post)
                .build();
    }

    public static PostLike postLike(FeedPost post, User user) {
        return PostLike.builder()
                .id(1L)
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public static Location location() {
        return Location.builder()
                .id(1L)
                .name("Central Courts")
                .address("123 Tennis Ave")
                .phone("555-0100")
                .email("central@test.com")
                .build();
    }

    public static Court court(Location location) {
        return Court.builder()
                .id(1L)
                .courtNumber(1)
                .location(location)
                .build();
    }

    public static PlayerProfile playerProfile(User user) {
        return PlayerProfile.builder()
                .id(1L)
                .user(user)
                .bio("Tennis enthusiast")
                .titlesCount(0)
                .finalsCount(0)
                .build();
    }

    public static TournamentRegistration registration(User player, Tournament tournament) {
        return TournamentRegistration.builder()
                .id(1L)
                .player(player)
                .tournament(tournament)
                .registeredAt(LocalDateTime.now())
                .build();
    }
}