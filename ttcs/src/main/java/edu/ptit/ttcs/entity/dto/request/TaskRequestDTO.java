package edu.ptit.ttcs.entity.dto.request;

import java.time.LocalDate;
import java.util.List;

public class TaskRequestDTO {
    private String name;
    private String description;
    private LocalDate dueDate;
    private Integer points;
    private Integer statusId;
    private Integer userId;
    private Integer userStoryId;
    private List<Integer> assigneeIds;
    private List<Long> tagIds;
    private List<Integer> watcherIds;

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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getStatusId() {
        return statusId;
    }

    public void setStatusId(Integer statusId) {
        this.statusId = statusId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getUserStoryId() {
        return userStoryId;
    }

    public void setUserStoryId(Integer userStoryId) {
        this.userStoryId = userStoryId;
    }

    public List<Integer> getAssigneeIds() {
        return assigneeIds;
    }

    public void setAssigneeIds(List<Integer> assigneeIds) {
        this.assigneeIds = assigneeIds;
    }

    public List<Long> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<Long> tagIds) {
        this.tagIds = tagIds;
    }

    public List<Integer> getWatcherIds() {
        return watcherIds;
    }

    public void setWatcherIds(List<Integer> watcherIds) {
        this.watcherIds = watcherIds;
    }
}