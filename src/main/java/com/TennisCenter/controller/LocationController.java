package com.TennisCenter.controller;

import com.TennisCenter.dto.location.CreateLocationRequest;
import com.TennisCenter.dto.location.LocationResponse;
import com.TennisCenter.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public List<LocationResponse> getAllLocations() {
        return locationService.getAllLocations();
    }

    @GetMapping("/{id}")
    public LocationResponse getLocationById(@PathVariable Long id) {
        return locationService.getLocationById(id);
    }

    @PostMapping
    public LocationResponse createLocation(@RequestBody CreateLocationRequest request) {
        return locationService.createLocation(request);
    }

    @PutMapping("/{id}")
    public LocationResponse updateLocation(
            @PathVariable Long id,
            @RequestBody CreateLocationRequest request) {
        return locationService.updateLocation(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
    }
}