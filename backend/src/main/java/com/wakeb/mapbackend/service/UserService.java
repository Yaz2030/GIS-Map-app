package com.wakeb.mapbackend.service;

import com.wakeb.mapbackend.model.Role;
import com.wakeb.mapbackend.model.User;
import com.wakeb.mapbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;
import com.wakeb.mapbackend.exception.EmailAlreadyExistsException;
import com.wakeb.mapbackend.exception.EmailNotVerifiedException;
import com.wakeb.mapbackend.exception.InvalidCredentialsException;
import com.wakeb.mapbackend.exception.UnauthorizedAccessException;
import com.wakeb.mapbackend.dto.UpdateNameRequest;

import com.wakeb.mapbackend.dto.ChangePasswordRequest;
import com.wakeb.mapbackend.dto.DeleteAccountRequest;
import com.wakeb.mapbackend.repository.LocationRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import com.wakeb.mapbackend.dto.ResetPasswordRequest;

import com.wakeb.mapbackend.dto.UserProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final JwtService jwtService;

    private final LocationRepository locationRepository;

    private final MailService mailService;

    private final MessageService messageService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public UserService(UserRepository userRepository, JwtService jwtService, LocationRepository locationRepository, MailService mailService, MessageService messageService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;

        this.locationRepository = locationRepository;
        this.mailService = mailService;
        this.messageService = messageService;
    }

    public User registerUser(User user) {
       Optional<User> existingUser =
        userRepository.findByEmail(user.getEmail());
       if (existingUser.isPresent()) {
           throw new EmailAlreadyExistsException("error.email.alreadyExists");
       }
       user.setRole(Role.USER);
       user.setPassword(passwordEncoder.encode(user.getPassword()));

       user.setEmailVerified(false);
       String token = UUID.randomUUID().toString();
       user.setEmailVerificationToken(token);
       user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
       user.setLastVerificationEmailSentAt(LocalDateTime.now());

       User savedUser = userRepository.save(user);

       String link = frontendUrl + "/verify-email?token=" + token;

       mailService.sendEmail(
               savedUser.getEmail(),
               messageService.get("email.verify.subject"),
               messageService.get("email.verify.body", link)
       );

       return savedUser;
    }

    public String loginUser(String email, String password) {
        Optional<User> existingUser =
        userRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            throw new InvalidCredentialsException("error.credentials.invalid");
        }
        User user = existingUser.get();

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {
            throw new InvalidCredentialsException(
                    "error.credentials.invalid"
            );
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException(
                    "error.email.notVerified"
            );
        }

        if (user.getRole() == null) {
            user.setRole(Role.USER);
            userRepository.save(user);
        }

        return jwtService.generateToken(
                user.getId(),
                user.getRole().name()
        );
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }


    public UserProfileResponse updateName(String userId, UpdateNameRequest request) {

        User existingUser = userRepository.findById(userId).orElse(null);

        if (existingUser == null) {
            return null;
        }

        existingUser.setName(request.getName());
        User savedUser = userRepository.save(existingUser);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());

        return response;

    }

    public User changePassword(String userId, ChangePasswordRequest request) {

        User existingUser = userRepository.findById(userId).orElse(null);

        if (existingUser == null) {
            return null;
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), existingUser.getPassword())) {
            throw new InvalidCredentialsException("error.currentPassword.incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("error.password.mismatch");
        }

        existingUser.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        return userRepository.save(existingUser);
    }

    public boolean deleteAccount(String userId, DeleteAccountRequest request) {

        User existingUser = userRepository.findById(userId).orElse(null);

        if (existingUser == null) {
            return false;
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                existingUser.getPassword()
        )) {
            throw new InvalidCredentialsException("error.account.incorrectPassword");
        }

        locationRepository.deleteByUserId(userId);
        userRepository.delete(existingUser);

        return true;
    }

    public void forgotPassword(String email) {

        User existingUser = userRepository.findByEmail(email).orElse(null);

        if (existingUser == null) {
            return;
        }

        LocalDateTime lastSent = existingUser.getLastPasswordResetEmailSentAt();
        if (lastSent != null && lastSent.plusMinutes(1).isAfter(LocalDateTime.now())) {
            return;
        }

        String token = UUID.randomUUID().toString();

        existingUser.setResetPasswordToken(token);

        existingUser.setResetPasswordTokenExpiry(
                LocalDateTime.now().plusMinutes(15)
        );

        existingUser.setLastPasswordResetEmailSentAt(LocalDateTime.now());

        userRepository.save(existingUser);

        String link =
                frontendUrl + "/reset-password?token=" + token;

        mailService.sendEmail(
                existingUser.getEmail(),
                messageService.get("email.resetPassword.subject"),
                messageService.get("email.resetPassword.body", link)
        );
    }

    public void verifyEmail(String token) {

        User existingUser =
                userRepository.findByEmailVerificationToken(token)
                        .orElse(null);

        if (existingUser == null) {
            throw new InvalidCredentialsException("error.verificationToken.invalid");
        }

        if (existingUser.getEmailVerificationTokenExpiry()
                .isBefore(LocalDateTime.now())) {

            throw new InvalidCredentialsException("error.verificationToken.expired");
        }

        existingUser.setEmailVerified(true);
        existingUser.setEmailVerificationToken(null);
        existingUser.setEmailVerificationTokenExpiry(null);

        userRepository.save(existingUser);
    }

    public void resendVerificationEmail(String email) {

        User existingUser = userRepository.findByEmail(email).orElse(null);

        if (existingUser == null || existingUser.isEmailVerified()) {
            return;
        }

        LocalDateTime lastSent = existingUser.getLastVerificationEmailSentAt();
        if (lastSent != null && lastSent.plusMinutes(1).isAfter(LocalDateTime.now())) {
            return;
        }

        String token = UUID.randomUUID().toString();
        existingUser.setEmailVerificationToken(token);
        existingUser.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        existingUser.setLastVerificationEmailSentAt(LocalDateTime.now());

        userRepository.save(existingUser);

        String link = frontendUrl + "/verify-email?token=" + token;

        mailService.sendEmail(
                existingUser.getEmail(),
                messageService.get("email.verify.subject"),
                messageService.get("email.verify.body", link)
        );
    }

    public void resetPassword(ResetPasswordRequest request) {

        User existingUser =
                userRepository.findByResetPasswordToken(request.getToken())
                        .orElse(null);

        if (existingUser == null) {
            throw new InvalidCredentialsException("error.resetToken.invalid");
        }

        if (existingUser.getResetPasswordTokenExpiry()
                .isBefore(LocalDateTime.now())) {

            throw new InvalidCredentialsException("error.resetToken.expired");
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException("error.password.mismatch");
        }

        existingUser.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        existingUser.setResetPasswordToken(null);
        existingUser.setResetPasswordTokenExpiry(null);

        userRepository.save(existingUser);
    }

    public UserProfileResponse getUserProfileById(String id) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return null;
        }

        UserProfileResponse response = new UserProfileResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        return response;
    }

    public Page<UserProfileResponse> getAllUsers(Pageable pageable) {

        return userRepository.findAll(pageable)
                .map(user -> {
                    UserProfileResponse response = new UserProfileResponse();

                    response.setId(user.getId());
                    response.setName(user.getName());
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole());

                    return response;
                });
    }

    public boolean deleteUserByAdmin(String targetUserId, String requestingAdminId) {

        if (targetUserId.equals(requestingAdminId)) {
            throw new UnauthorizedAccessException("error.admin.cannotDeleteSelf");
        }

        User existingUser = userRepository.findById(targetUserId).orElse(null);

        if (existingUser == null) {
            return false;
        }

        locationRepository.deleteByUserId(targetUserId);
        userRepository.delete(existingUser);

        return true;
    }
}
