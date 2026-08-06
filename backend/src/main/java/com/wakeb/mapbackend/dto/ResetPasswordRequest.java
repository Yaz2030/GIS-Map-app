package com.wakeb.mapbackend.dto;

import jakarta.validation.constraints.NotBlank;
import com.wakeb.mapbackend.validation.StrongPassword;

public class ResetPasswordRequest {

    @NotBlank(message = "validation.token.required")
    private String token;

    @NotBlank(message = "validation.newPassword.required")
    @StrongPassword
    private String newPassword;

    @NotBlank(message = "validation.confirmPassword.required")
    private String confirmPassword;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}