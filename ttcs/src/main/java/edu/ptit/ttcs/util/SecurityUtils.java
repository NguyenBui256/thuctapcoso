package edu.ptit.ttcs.util;

import edu.ptit.ttcs.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

public class SecurityUtils {

    public static User getCurrentUser() {
        // For testing purposes, return a default user with ID 1
        User defaultUser = new User();
        defaultUser.setId(1L);
        defaultUser.setUsername("default");
        return defaultUser;
    }
}