package com.wakeb.mapbackend.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateNameRequest {

    @NotBlank(message = "validation.name.required")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}