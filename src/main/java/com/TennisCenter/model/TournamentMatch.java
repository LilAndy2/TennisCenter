package com.TennisCenter.model;

import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "tournament_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_one_id")
    private User playerOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_two_id")
    private User playerTwo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentMatchPhase phase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentMatchStatus status;

    @Column
    private Integer roundNumber;

    @Column
    private String groupName;

    @Column
    private Integer matchOrder;

    @Column
    private LocalDate matchDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;
}
