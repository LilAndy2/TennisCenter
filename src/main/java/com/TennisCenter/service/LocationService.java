package com.TennisCenter.service;

import com.TennisCenter.dto.location.CourtResponse;
import com.TennisCenter.dto.location.CreateLocationRequest;
import com.TennisCenter.dto.location.LocationResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.Court;
import com.TennisCenter.model.Location;
import com.TennisCenter.repository.CourtRepository;
import com.TennisCenter.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final CourtRepository courtRepository;

    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public LocationResponse getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));
        return mapToResponse(location);
    }

    public LocationResponse createLocation(CreateLocationRequest request) {
        Location location = Location.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();

        Location saved = locationRepository.save(location);

        for (int i = 1; i <= 5; i++) {
            Court court = Court.builder()
                    .courtNumber(i)
                    .location(saved)
                    .build();
            courtRepository.save(court);
        }

        return mapToResponse(locationRepository.findById(saved.getId()).orElseThrow());
    }

    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));
        locationRepository.delete(location);
    }

    public LocationResponse mapToResponse(Location location) {
        List<CourtResponse> courts = courtRepository
                .findByLocationIdOrderByCourtNumberAsc(location.getId())
                .stream()
                .map(court -> CourtResponse.builder()
                        .id(court.getId())
                        .courtNumber(court.getCourtNumber())
                        .build())
                .toList();

        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .address(location.getAddress())
                .phone(location.getPhone())
                .email(location.getEmail())
                .courts(courts)
                .build();
    }
}