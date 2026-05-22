package com.TennisCenter.service.match;

import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.repository.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UmpireService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final ScheduledMatchMapper scheduledMatchMapper;

    public List<ScheduledMatchResponse> getMatchesForUmpire(Long umpireId) {
        return tournamentMatchRepository.findByUmpireIdOrderByScheduledTimeAsc(umpireId)
                .stream()
                .map(scheduledMatchMapper::toResponse)
                .sorted(Comparator.comparing(
                        ScheduledMatchResponse::getScheduledTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }
}