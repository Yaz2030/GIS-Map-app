package com.wakeb.mapbackend.controller;

import com.wakeb.mapbackend.dto.UserProfileResponse;
import com.wakeb.mapbackend.service.MessageService;
import com.wakeb.mapbackend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final MessageService messageService;

    public AdminController(UserService userService, MessageService messageService) {
        this.userService = userService;
        this.messageService = messageService;
    }

    @GetMapping("/users")
    public Page<UserProfileResponse> getAllUsers(Pageable pageable) {
        return userService.getAllUsers(pageable);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable String id) {

        UserProfileResponse response = userService.getUserProfileById(id);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable String id,
            Authentication authentication
    ) {

        boolean deleted = userService.deleteUserByAdmin(id, authentication.getName());

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(messageService.get("success.admin.userDeleted"));
    }
}