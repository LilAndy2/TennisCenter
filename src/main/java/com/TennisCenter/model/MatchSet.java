package com.TennisCenter.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id")
    private TournamentMatch match;

    @Column(nullable = false)
    private Integer setNumber;

    @Column(nullable = false)
    private Integer playerOneGames;

    @Column(nullable = false)
    private Integer playerTwoGames;

    @Column
    private Integer playerOneTiebreakPoints;

    @Column
    private Integer playerTwoTiebreakPoints;
}
