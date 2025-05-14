package edu.ptit.ttcs.entity.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class UserStoryResponseDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer statusId;
    private Integer swimlaneId;
    private Long projectId;
    private Integer uxPoints;
    private Integer backPoints;
    private Integer frontPoints;
    private Integer designPoints;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private String createdByFullName;
    private String createdByUsername;
    private Long assignedUserId;
    private Boolean isBlocked;
    private List<UserDTO> assignedUsers;
    private List<AttachmentDTO> attachments;
    private List<TagDTO> tags;

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getStatusId() {
        return statusId;
    }

    public void setStatusId(Integer statusId) {
        this.statusId = statusId;
    }

    public Integer getSwimlaneId() {
        return swimlaneId;
    }

    public void setSwimlaneId(Integer swimlaneId) {
        this.swimlaneId = swimlaneId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Integer getUxPoints() {
        return uxPoints;
    }

    public void setUxPoints(Integer uxPoints) {
        this.uxPoints = uxPoints;
    }

    public Integer getBackPoints() {
        return backPoints;
    }

    public void setBackPoints(Integer backPoints) {
        this.backPoints = backPoints;
    }

    public Integer getFrontPoints() {
        return frontPoints;
    }

    public void setFrontPoints(Integer frontPoints) {
        this.frontPoints = frontPoints;
    }

    public Integer getDesignPoints() {
        return designPoints;
    }

    public void setDesignPoints(Integer designPoints) {
        this.designPoints = designPoints;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedByFullName() {
        return createdByFullName;
    }

    public void setCreatedByFullName(String createdByFullName) {
        this.createdByFullName = createdByFullName;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public Long getAssignedUserId() {
        return assignedUserId;
    }

    public void setAssignedUserId(Long assignedUserId) {
        this.assignedUserId = assignedUserId;
    }

    public Boolean getIsBlocked() {
        return isBlocked;
    }

    public void setIsBlocked(Boolean isBlocked) {
        this.isBlocked = isBlocked;
    }

    public List<UserDTO> getAssignedUsers() {
        return assignedUsers;
    }

    public void setAssignedUsers(List<UserDTO> assignedUsers) {
        this.assignedUsers = assignedUsers;
    }

    public List<AttachmentDTO> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentDTO> attachments) {
        this.attachments = attachments;
    }

    public List<TagDTO> getTags() {
        return tags;
    }

    public void setTags(List<TagDTO> tags) {
        this.tags = tags;
    }

    // Add methods with alternative naming for Jackson serialization
    public Boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(Boolean blocked) {
        this.isBlocked = blocked;
    }

    // Add TagDTO inner class
    public static class TagDTO {
        private Long id;
        private String name;
        private String color;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
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
}