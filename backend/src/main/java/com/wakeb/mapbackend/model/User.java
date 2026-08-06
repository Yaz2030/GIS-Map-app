package com.wakeb.mapbackend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wakeb.mapbackend.validation.StrongPassword;
import java.time.LocalDateTime;
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "validation.name.required")
    private String name;

    @NotBlank(message = "validation.email.required")
    @Email(message = "validation.email.invalid")
    private String email;

    @NotBlank(message = "validation.password.required")
    @StrongPassword
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String resetPasswordToken;

    private LocalDateTime resetPasswordTokenExpiry;

    private LocalDateTime lastPasswordResetEmailSentAt;

    private boolean emailVerified;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String emailVerificationToken;

    private LocalDateTime emailVerificationTokenExpiry;

    private LocalDateTime lastVerificationEmailSentAt;

    private Role role;
    public User() {
    }

    public User(String id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getResetPasswordToken() {
        return resetPasswordToken;
    }

    public void setResetPasswordToken(String resetPasswordToken) {
        this.resetPasswordToken = resetPasswordToken;
    }

    public LocalDateTime getResetPasswordTokenExpiry() {
        return resetPasswordTokenExpiry;
    }

    public void setResetPasswordTokenExpiry(LocalDateTime resetPasswordTokenExpiry) {
        this.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDateTime getLastPasswordResetEmailSentAt() {
        return lastPasswordResetEmailSentAt;
    }

    public void setLastPasswordResetEmailSentAt(LocalDateTime lastPasswordResetEmailSentAt) {
        this.lastPasswordResetEmailSentAt = lastPasswordResetEmailSentAt;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public LocalDateTime getEmailVerificationTokenExpiry() {
        return emailVerificationTokenExpiry;
    }

    public void setEmailVerificationTokenExpiry(LocalDateTime emailVerificationTokenExpiry) {
        this.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
    }

    public LocalDateTime getLastVerificationEmailSentAt() {
        return lastVerificationEmailSentAt;
    }

    public void setLastVerificationEmailSentAt(LocalDateTime lastVerificationEmailSentAt) {
        this.lastVerificationEmailSentAt = lastVerificationEmailSentAt;
    }
}
