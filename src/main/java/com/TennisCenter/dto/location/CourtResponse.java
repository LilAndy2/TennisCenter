package com.TennisCenter.dto.location;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourtResponse {
    private Long id;
    private Integer courtNumber;
}