package com.wakeb.mapbackend.dto;

import jakarta.validation.constraints.NotBlank;
import com.wakeb.mapbackend.validation.StrongPassword;

public class ChangePasswordRequest {

    @NotBlank(message = "validation.currentPassword.required")
    private String currentPassword;

    @NotBlank(message = "validation.newPassword.required")
    @StrongPassword
    private String newPassword;

    @NotBlank(message = "validation.confirmPassword.required")
    private String confirmPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
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