package com.wakeb.mapbackend.controller;

import com.wakeb.mapbackend.model.User;
import com.wakeb.mapbackend.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;

import com.wakeb.mapbackend.dto.UpdateNameRequest;

import org.springframework.web.bind.annotation.PutMapping;

import com.wakeb.mapbackend.dto.ChangePasswordRequest;

import com.wakeb.mapbackend.dto.DeleteAccountRequest;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.wakeb.mapbackend.service.MailService;

import com.wakeb.mapbackend.dto.ForgotPasswordRequest;

import com.wakeb.mapbackend.dto.ResetPasswordRequest;
import com.wakeb.mapbackend.dto.UserProfileResponse;
import com.wakeb.mapbackend.dto.VerifyEmailRequest;
import com.wakeb.mapbackend.dto.ResendVerificationRequest;
import com.wakeb.mapbackend.dto.RegisterRequest;
import com.wakeb.mapbackend.dto.LoginRequest;
import com.wakeb.mapbackend.service.MessageService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final MessageService messageService;

    public UserController(UserService userService, MailService mailService, MessageService messageService) {

        this.userService = userService;
        this.messageService = messageService;
    }

    @PostMapping("/register")
    public UserProfileResponse createUser(@Valid @RequestBody RegisterRequest request) {

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User savedUser = userService.registerUser(user);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());

        return response;
    }

    @PostMapping("/login")
    public String loginUser(@Valid @RequestBody LoginRequest request) {
        return userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {

        UserProfileResponse response =
                userService.getUserProfileById(authentication.getName());

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/name")
    public ResponseEntity<UserProfileResponse> updateName(
            Authentication authentication,
            @Valid @RequestBody UpdateNameRequest request
    ) {

        UserProfileResponse response = userService.updateName(
                authentication.getName(),
                request
        );

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        User user = userService.changePassword(
                authentication.getName(),
                request
        );

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(messageService.get("success.password.changed"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteAccount(
            Authentication authentication,
            @Valid @RequestBody DeleteAccountRequest request
    ) {

        boolean deleted = userService.deleteAccount(
                authentication.getName(),
                request
        );

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(messageService.get("success.account.deleted"));
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        userService.forgotPassword(request.getEmail());

        return ResponseEntity.ok(
                messageService.get("success.passwordReset.linkSent")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        userService.resetPassword(request);

        return ResponseEntity.ok(messageService.get("success.password.reset"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {

        userService.verifyEmail(request.getToken());

        return ResponseEntity.ok(messageService.get("success.email.verified"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request
    ) {

        userService.resendVerificationEmail(request.getEmail());

        return ResponseEntity.ok(
                messageService.get("success.verification.linkSent")
        );
    }
}
