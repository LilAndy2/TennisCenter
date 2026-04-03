package com.TennisCenter.controller;

import com.TennisCenter.dto.location.LocationResponse;
import com.TennisCenter.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/locations")
@RequiredArgsConstructor
public class PublicLocationController {

    private final LocationService locationService;

    @GetMapping
    public List<LocationResponse> getAllLocations() {
        return locationService.getAllLocations();
    }
}