package com.TennisCenter.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column
    private String profileImageUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false)
    @Builder.Default
    private Integer titlesCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer finalsCount = 0;
}
