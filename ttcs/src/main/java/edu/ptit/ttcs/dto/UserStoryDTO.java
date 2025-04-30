package edu.ptit.ttcs.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UserStoryDTO {
    private Integer id;
    private String subject;
    private String description;
    private String status;
    private Integer createdBy;
    private LocalDateTime createdDate;
    private Integer assignedTo;
    private Integer uxPoints;
    private Integer designPoints;
    private Integer frontPoints;
    private Integer backPoints;
    private List<String> attachments;
    private List<TaskDTO> tasks;
    private List<Integer> watchers;
    private List<ActivityDTO> activities;
    private List<CommentDTO> comments;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public Integer getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Integer assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Integer getUxPoints() {
        return uxPoints;
    }

    public void setUxPoints(Integer uxPoints) {
        this.uxPoints = uxPoints;
    }

    public Integer getDesignPoints() {
        return designPoints;
    }

    public void setDesignPoints(Integer designPoints) {
        this.designPoints = designPoints;
    }

    public Integer getFrontPoints() {
        return frontPoints;
    }

    public void setFrontPoints(Integer frontPoints) {
        this.frontPoints = frontPoints;
    }

    public Integer getBackPoints() {
        return backPoints;
    }

    public void setBackPoints(Integer backPoints) {
        this.backPoints = backPoints;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }

    public List<TaskDTO> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskDTO> tasks) {
        this.tasks = tasks;
    }

    public List<Integer> getWatchers() {
        return watchers;
    }

    public void setWatchers(List<Integer> watchers) {
        this.watchers = watchers;
    }

    public List<ActivityDTO> getActivities() {
        return activities;
    }

    public void setActivities(List<ActivityDTO> activities) {
        this.activities = activities;
    }

    public List<CommentDTO> getComments() {
        return comments;
    }

    public void setComments(List<CommentDTO> comments) {
        this.comments = comments;
    }
}