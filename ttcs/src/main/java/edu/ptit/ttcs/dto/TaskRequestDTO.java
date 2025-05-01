package edu.ptit.ttcs.dto;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public class TaskRequestDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer userId;
    private Integer userStoryId;
    private Integer statusId;
    private LocalDate dueDate;
    private List<Integer> tagIds;
    private List<Integer> watcherIds;
    private List<Integer> assigneeIds;
    private Integer points;

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

    public Integer getStatusId() {
        return statusId;
    }

    public void setStatusId(Integer statusId) {
        this.statusId = statusId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public List<Integer> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<Integer> tagIds) {
        this.tagIds = tagIds;
    }

    public List<Integer> getWatcherIds() {
        return watcherIds;
    }

    public void setWatcherIds(List<Integer> watcherIds) {
        this.watcherIds = watcherIds;
    }

    public List<Integer> getAssigneeIds() {
        return assigneeIds;
    }

    public void setAssigneeIds(List<Integer> assigneeIds) {
        this.assigneeIds = assigneeIds;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }
}