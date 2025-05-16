package edu.ptit.ttcs.service;

import edu.ptit.ttcs.entity.dto.UserProfileDTO;

public interface UserProfileService {

    /**
     * Get user profile details including timeline notifications
     * 
     * @param userId The ID of the user
     * @return UserProfileDTO containing user information and timeline
     */
    UserProfileDTO getUserProfile(Long userId);

    /**
     * Get user profile for the currently authenticated user
     * 
     * @return UserProfileDTO containing user information and timeline
     */
    UserProfileDTO getCurrentUserProfile();
}