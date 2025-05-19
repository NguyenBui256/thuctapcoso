package edu.ptit.ttcs.entity.dto;

import edu.ptit.ttcs.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String bio;
    private String photoUrl;
    private Integer totalProjects;
    private Integer closedUserStories;
    private Integer totalContacts;
    private List<NotificationDTO> timeline;
}