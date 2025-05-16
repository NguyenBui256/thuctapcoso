package edu.ptit.ttcs.util;

import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.UserSettingsRepository;
import edu.ptit.ttcs.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

@Slf4j
@Component
public class SecurityUtils {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserSettingsRepository userSettingsRepository;

    public String getCurrentUserPhotoUrl() {
        User currentUser = getCurrentUser();
        return userSettingsRepository.findByUser(currentUser).orElse(null).getPhotoUrl();
    }

    public User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.error("No authentication found or user is not authenticated");
                throw new RuntimeException("User is not authenticated");
            }

            Object principal = authentication.getPrincipal();
            log.info("Principal type: {}", principal.getClass().getName());

            String username;
            if (principal instanceof UserDetails userDetails) {
                username = userDetails.getUsername();
            } else if (principal instanceof Jwt jwt) {
                username = jwt.getSubject();
            } else if (principal instanceof String) {
                username = (String) principal;
            } else {
                log.error("Unknown principal type: {}", principal.getClass().getName());
                throw new RuntimeException("Unknown principal type");
            }

            log.info("Extracted username: {}", username);
            if (username == null) {
                log.error("No username found in authentication");
                throw new RuntimeException("No username found in authentication");
            }

            return userRepository.findByUsernameOrEmail(username)
                    .orElseThrow(() -> {
                        log.error("User not found for username: {}", username);
                        return new RuntimeException("User not found");
                    });
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage());
            throw new RuntimeException("Error getting current user", e);
        }
    }

    private static String extractPrincipal(Authentication authentication) {
        if (authentication == null) {
            log.error("Authentication is null");
            return null;
        }

        Object principal = authentication.getPrincipal();
        log.info("Principal type: {}", principal.getClass().getName());

        if (principal instanceof UserDetails springSecurityUser) {
            log.info("Principal is UserDetails");
            return springSecurityUser.getUsername();
        } else if (principal instanceof Jwt jwt) {
            log.info("Principal is Jwt");
            return jwt.getSubject();
        } else if (principal instanceof String s) {
            log.info("Principal is String");
            return s;
        }

        log.error("Unknown principal type: {}", principal.getClass().getName());
        return null;
    }

    /**
     * Get the ID of the currently authenticated user
     * 
     * @return ID of the current user or null if not found
     */
    public Long getCurrentUserId() {
        try {
            User currentUser = getCurrentUser();
            return currentUser != null ? currentUser.getId() : null;
        } catch (Exception e) {
            log.error("Error getting current user ID: {}", e.getMessage());
            return null;
        }
    }
}