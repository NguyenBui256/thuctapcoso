package edu.ptit.ttcs.entity.dto;

import java.time.LocalDate;
import java.util.List;

public class TaskDTO {
    private Integer id;
    private String subject;
    private String status;
    private Integer assignedToId;
    private String assignedToName;
    private List<UserDTO> assignees;
    private Integer userStoryId;
    private String userStoryName;
    private String description;
    private LocalDate dueDate;
    private LocalDate createdAt;
    private List<TagDTO> tags;
    private List<UserDTO> watchers;
    private Integer statusId;
    private Boolean isBlocked;
    private String statusName;
    private Integer points;

    // Nested DTO for tags
    public static class TagDTO {
        private Integer id;
        private String name;
        private String color;

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }
    }

    // Nested DTO for users
    public static class UserDTO {
        private Integer id;
        private String username;
        private String fullName;

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
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
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getAssignedTo() {
        return assignedToId;
    }

    public void setAssignedTo(Integer assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public Integer getUserStoryId() {
        return userStoryId;
    }

    public void setUserStoryId(Integer userStoryId) {
        this.userStoryId = userStoryId;
    }

    public String getUserStoryName() {
        return userStoryName;
    }

    public void setUserStoryName(String userStoryName) {
        this.userStoryName = userStoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public List<TagDTO> getTags() {
        return tags;
    }

    public void setTags(List<TagDTO> tags) {
        this.tags = tags;
    }

    public List<UserDTO> getWatchers() {
        return watchers;
    }

    public void setWatchers(List<UserDTO> watchers) {
        this.watchers = watchers;
    }

    public List<UserDTO> getAssignees() {
        return assignees;
    }

    public void setAssignees(List<UserDTO> assignees) {
        this.assignees = assignees;
    }

    public Integer getStatusId() {
        return statusId;
    }

    public void setStatusId(Integer statusId) {
        this.statusId = statusId;
    }

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }

    public Boolean getIsBlocked() {
        return isBlocked;
    }

    public void setIsBlocked(Boolean isBlocked) {
        this.isBlocked = isBlocked;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }
}