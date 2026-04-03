package com.TennisCenter.dto.location;

import lombok.Data;

@Data
public class CreateLocationRequest {
    private String name;
    private String address;
    private String phone;
    private String email;
}