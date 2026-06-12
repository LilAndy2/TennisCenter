package com.TennisCenter.controller;

import com.TennisCenter.dto.h2h.H2HResponse;
import com.TennisCenter.service.match.H2HService;
import com.TennisCenter.service.match.MatchPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/h2h")
@RequiredArgsConstructor
public class H2HController {

    private final H2HService h2hService;
    private final MatchPredictionService matchPredictionService;
    
    @GetMapping
    public H2HResponse getH2H(
            @RequestParam Long playerAId,
            @RequestParam Long playerBId
    ) {
        return h2hService.getH2H(playerAId, playerBId);
    }

    @GetMapping("/search-players")
    public List<H2HResponse.PlayerSummary> searchPlayers(
            @RequestParam(defaultValue = "") String query
    ) {
        return h2hService.searchPlayers(query);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/train-model")
    public ResponseEntity<Map<String, Object>> trainModel() {
        int count = matchPredictionService.trainWeights();
        return ResponseEntity.ok(Map.of(
                "message", "Model training completed",
                "trainingExamples", count
        ));
    }
}