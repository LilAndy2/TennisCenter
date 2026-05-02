package com.TennisCenter.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ranking_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankingPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private TournamentMatch match;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private LocalDate awardedDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private boolean win;
}