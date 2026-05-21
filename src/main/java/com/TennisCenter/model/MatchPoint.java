package com.TennisCenter.model;

import com.TennisCenter.model.enums.PointOutcome;
import com.TennisCenter.model.enums.ServeType;
import com.TennisCenter.model.enums.ShotType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private TournamentMatch match;

    /** The player who won this point. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "point_winner_id", nullable = false)
    private User pointWinner;

    /** The player who was serving during this point. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "server_id", nullable = false)
    private User server;

    @Column(nullable = false)
    private Integer pointNumber;

    @Column(nullable = false)
    private Integer setNumber;

    @Column(nullable = false)
    private Integer gameNumber;

    /** Score state BEFORE this point was played (e.g. "30-15"). */
    @Column(nullable = false, length = 20)
    private String scoreBefore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServeType serveType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PointOutcome pointOutcome;

    /** Null for ACE / DOUBLE_FAULT / generic POINT_WON. */
    @Enumerated(EnumType.STRING)
    @Column
    private ShotType shotType;

    @Column(nullable = false)
    private LocalDateTime recordedAt;
}