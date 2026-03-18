package com.TennisCenter.config;

import com.TennisCenter.model.*;
import com.TennisCenter.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class TournamentSeeder implements CommandLineRunner {

    private final TournamentRepository tournamentRepository;

    @Override
    public void run(String... args) {
        if (tournamentRepository.count() > 0) {
            return;
        }

        tournamentRepository.save(Tournament.builder()
                .name("Spring Local Open")
                .level(TournamentLevel.ENTRY)
                .status(TournamentStatus.UPCOMING)
                .surface(TournamentSurface.CLAY)
                .startDate(LocalDate.of(2026, 4, 5))
                .endDate(LocalDate.of(2026, 4, 6))
                .maxPlayers(16)
                .location("Tennis Arena Bucharest")
                .description("A beginner-friendly local tournament designed for players entering competitive tennis.")
                .isFull(false)
                .build());

        tournamentRepository.save(Tournament.builder()
                .name("Starter Cup")
                .level(TournamentLevel.STARTER)
                .status(TournamentStatus.ONGOING)
                .surface(TournamentSurface.HARD)
                .startDate(LocalDate.of(2026, 3, 10))
                .endDate(LocalDate.of(2026, 3, 16))
                .maxPlayers(16)
                .location("Urban Tennis Club")
                .description("A competitive event for starter-level players looking to build match experience.")
                .isFull(true)
                .build());

        tournamentRepository.save(Tournament.builder()
                .name("Elite Expert Series")
                .level(TournamentLevel.EXPERT)
                .status(TournamentStatus.FINISHED)
                .surface(TournamentSurface.CLAY)
                .startDate(LocalDate.of(2026, 2, 18))
                .endDate(LocalDate.of(2026, 2, 20))
                .maxPlayers(24)
                .location("National Tennis Center")
                .description("An expert-level event bringing together the strongest local players.")
                .isFull(true)
                .build());
    }
}