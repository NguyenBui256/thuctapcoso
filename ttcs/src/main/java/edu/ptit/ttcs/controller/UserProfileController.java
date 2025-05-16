package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.UserProfileDTO;
import edu.ptit.ttcs.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
        log.info("Getting current user profile");
        try {
            UserProfileDTO profile = userProfileService.getCurrentUserProfile();
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error getting current user profile: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Long userId) {
        log.info("Getting user profile for user ID: {}", userId);
        try {
            UserProfileDTO profile = userProfileService.getUserProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error getting user profile: {}", e.getMessage());
            throw e;
        }
    }
}