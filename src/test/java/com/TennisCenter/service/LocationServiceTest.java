package com.TennisCenter.service;

import com.TennisCenter.dto.location.LocationResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.Location;
import com.TennisCenter.repository.CourtRepository;
import com.TennisCenter.repository.LocationRepository;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock private LocationRepository locationRepository;
    @Mock private CourtRepository courtRepository;

    @InjectMocks private LocationService locationService;

    @Test
    void getAllLocations_shouldReturnMappedLocations() {
        Location loc = TestDataFactory.location();
        when(locationRepository.findAllByOrderByNameAsc()).thenReturn(List.of(loc));
        when(courtRepository.findByLocationIdOrderByCourtNumberAsc(loc.getId()))
                .thenReturn(List.of(TestDataFactory.court(loc)));

        List<LocationResponse> result = locationService.getAllLocations();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Central Courts");
    }

    @Test
    void getLocationById_shouldThrowWhenNotFound() {
        when(locationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> locationService.getLocationById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteLocation_shouldRemoveExistingLocation() {
        Location loc = TestDataFactory.location();
        when(locationRepository.findById(1L)).thenReturn(Optional.of(loc));

        locationService.deleteLocation(1L);

        verify(locationRepository).delete(loc);
    }

    @Test
    void deleteLocation_shouldThrowWhenNotFound() {
        when(locationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> locationService.deleteLocation(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}