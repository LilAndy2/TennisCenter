package com.TennisCenter.model;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    /**
     * Legacy single-role column — kept for backward compatibility with existing data.
     * New code should use the 'roles' set instead.
     * This field is maintained in sync by the register/login flows.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * Multi-role support: a user can have multiple roles (e.g. PLAYER + UMPIRE).
     * Stored in a separate 'user_roles' join table.
     */
    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private PlayerLevel playerLevel;

    @Column(nullable = false)
    @Builder.Default
    private Integer rankingPoints = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer wins = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer losses = 0;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return password;
    }

    // Login is done via email
    @Override
    public String getUsername() {
        return email;
    }

    public String getDisplayUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    /**
     * Convenience: check if the user has a specific role.
     */
    public boolean hasRole(Role r) {
        return roles.contains(r);
    }

    /**
     * Returns the "primary" display role — prioritizes ADMIN > PLAYER > UMPIRE.
     * Used for display purposes (e.g. feed post author role badge).
     */
    public String getPrimaryDisplayRole() {
        if (roles.contains(Role.ADMIN)) return Role.ADMIN.getDisplayName();
        if (roles.contains(Role.PLAYER)) return Role.PLAYER.getDisplayName();
        if (roles.contains(Role.UMPIRE)) return Role.UMPIRE.getDisplayName();
        return role.getDisplayName(); // fallback to legacy
    }
}
