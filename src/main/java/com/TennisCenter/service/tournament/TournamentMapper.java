package com.TennisCenter.service.tournament;

import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.model.Tournament;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.enums.TournamentStatus;
import com.TennisCenter.repository.TournamentLocationRepository;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TournamentMapper {

    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final TournamentLocationRepository tournamentLocationRepository;

    public TournamentResponse toResponse(Tournament tournament, User currentUser) {
        int currentPlayers = (int) tournamentRegistrationRepository
                .countByTournamentId(tournament.getId());

        boolean registeredByCurrentUser = currentUser != null &&
                tournamentRegistrationRepository.existsByPlayerIdAndTournamentId(
                        currentUser.getId(), tournament.getId());

        boolean currentUserAdmin = currentUser != null && currentUser.getRole() == Role.ADMIN;

        boolean registrationAllowedByLevel = resolveRegistrationAllowedByLevel(tournament, currentUser);

        boolean registrationOpen = tournament.getStatus() == TournamentStatus.UPCOMING
                && !tournament.isFull()
                && !currentUserAdmin
                && registrationAllowedByLevel;

        return TournamentResponse.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .level(tournament.getLevel().getDisplayName())
                .status(tournament.getStatus().getDisplayName())
                .surface(tournament.getSurface().getDisplayName())
                .startDate(tournament.getStartDate().toString())
                .endDate(tournament.getEndDate().toString())
                .maxPlayers(tournament.getMaxPlayers())
                .currentPlayers(currentPlayers)
                .description(tournament.getDescription())
                .isFull(tournament.isFull())
                .registeredByCurrentUser(registeredByCurrentUser)
                .registrationOpen(registrationOpen)
                .registrationAllowedByLevel(registrationAllowedByLevel)
                .currentUserAdmin(currentUserAdmin)
                .bracketType(tournament.getBracketType().getDisplayName())
                .locationIds(
                        tournamentLocationRepository.findByTournamentId(tournament.getId())
                                .stream()
                                .map(tl -> tl.getLocation().getId())
                                .toList()
                )
                .locationNames(
                        tournamentLocationRepository.findByTournamentId(tournament.getId())
                                .stream()
                                .map(tl -> tl.getLocation().getName())
                                .toList()
                )
                .build();
    }

    private boolean resolveRegistrationAllowedByLevel(Tournament tournament, User currentUser) {
        if (currentUser == null) return false;
        if (currentUser.getRole() != Role.PLAYER) return false;
        if (currentUser.getPlayerLevel() == null) return false;
        return currentUser.getPlayerLevel().ordinal() <= tournament.getLevel().ordinal();
    }
}