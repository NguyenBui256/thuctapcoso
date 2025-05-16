package edu.ptit.ttcs.entity.dto;

import edu.ptit.ttcs.entity.User;

public class UserDTO {
    private Long id;
    private String username;
    private String fullName;
    private int closedUserStories;
    private String bio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getClosedUserStories() {
        return closedUserStories;
    }

    public void setClosedUserStories(int closedUserStories) {
        this.closedUserStories = closedUserStories;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public static UserDTO fromEntity(User user) {
        if (user == null)
            return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        return dto;
    }
}