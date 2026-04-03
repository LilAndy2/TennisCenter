package com.TennisCenter.service;

import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final TournamentMatchRepository tournamentMatchRepository;

    public List<ScheduledMatchResponse> getAllScheduledMatches() {
        return tournamentMatchRepository.findAll()
                .stream()
                .filter(match -> match.getScheduledTime() != null)
                .map(this::mapToScheduledResponse)
                .sorted(Comparator.comparing(ScheduledMatchResponse::getScheduledTime))
                .toList();
    }

    private ScheduledMatchResponse mapToScheduledResponse(TournamentMatch match) {
        return ScheduledMatchResponse.builder()
                .matchId(match.getId())
                .scheduledTime(match.getScheduledTime().toString())
                .matchDate(match.getScheduledTime().toLocalDate().toString())
                .playerOneName(match.getPlayerOne() != null
                        ? match.getPlayerOne().getFirstName() + " " + match.getPlayerOne().getLastName()
                        : "TBD")
                .playerTwoName(match.getPlayerTwo() != null
                        ? match.getPlayerTwo().getFirstName() + " " + match.getPlayerTwo().getLastName()
                        : "TBD")
                .tournamentName(match.getTournament().getName())
                .tournamentLevel(match.getTournament().getLevel().name())
                .courtId(match.getCourt() != null ? match.getCourt().getId() : null)
                .courtNumber(match.getCourt() != null ? match.getCourt().getCourtNumber() : null)
                .locationId(match.getCourt() != null ? match.getCourt().getLocation().getId() : null)
                .locationName(match.getCourt() != null ? match.getCourt().getLocation().getName() : null)
                .status(match.getStatus().name())
                .winnerName(match.getWinner() != null
                        ? match.getWinner().getFirstName() + " " + match.getWinner().getLastName()
                        : null)
                .build();
    }
}