package com.TennisCenter.dto.location;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LocationResponse {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private List<CourtResponse> courts;
}