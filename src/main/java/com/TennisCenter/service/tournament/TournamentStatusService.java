package com.TennisCenter.service.tournament;

import com.TennisCenter.model.Tournament;
import com.TennisCenter.model.enums.TournamentStatus;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class TournamentStatusService {

    private final TournamentRegistrationRepository tournamentRegistrationRepository;

    /**
     * Automatically transitions a tournament's status based on today's date.
     * FINISHED tournaments are never touched.
     * UPCOMING tournaments that have reached their start date become ONGOING.
     * ONGOING or UPCOMING tournaments that have passed their end date become FINISHED.
     */
    public void syncWithDates(Tournament tournament) {
        if (tournament.getStatus() == TournamentStatus.FINISHED) return;

        LocalDate today = LocalDate.now();

        if (today.isAfter(tournament.getEndDate())) {
            tournament.setStatus(TournamentStatus.FINISHED);
            return;
        }

        boolean startedOrToday = today.isEqual(tournament.getStartDate())
                || today.isAfter(tournament.getStartDate());

        if (startedOrToday && tournament.getStatus() == TournamentStatus.UPCOMING) {
            tournament.setStatus(TournamentStatus.ONGOING);
        }
    }

    /**
     * Recalculates and sets the isFull flag based on current registration count.
     */
    public void syncFullStatus(Tournament tournament) {
        long currentPlayers = tournamentRegistrationRepository
                .countByTournamentId(tournament.getId());
        tournament.setFull(currentPlayers >= tournament.getMaxPlayers());
    }
}