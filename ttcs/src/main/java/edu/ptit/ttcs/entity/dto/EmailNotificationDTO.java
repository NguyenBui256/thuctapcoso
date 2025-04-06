package edu.ptit.ttcs.entity.dto;

public class EmailNotificationDTO {
    private boolean projectUpdates;
    private boolean taskUpdates;
    private boolean commentUpdates;
    private boolean mentionUpdates;
    private boolean deadlineReminders;
    private boolean weeklyDigest;

    public boolean isProjectUpdates() {
        return projectUpdates;
    }

    public void setProjectUpdates(boolean projectUpdates) {
        this.projectUpdates = projectUpdates;
    }

    public boolean isTaskUpdates() {
        return taskUpdates;
    }

    public void setTaskUpdates(boolean taskUpdates) {
        this.taskUpdates = taskUpdates;
    }

    public boolean isCommentUpdates() {
        return commentUpdates;
    }

    public void setCommentUpdates(boolean commentUpdates) {
        this.commentUpdates = commentUpdates;
    }

    public boolean isMentionUpdates() {
        return mentionUpdates;
    }

    public void setMentionUpdates(boolean mentionUpdates) {
        this.mentionUpdates = mentionUpdates;
    }

    public boolean isDeadlineReminders() {
        return deadlineReminders;
    }

    public void setDeadlineReminders(boolean deadlineReminders) {
        this.deadlineReminders = deadlineReminders;
    }

    public boolean isWeeklyDigest() {
        return weeklyDigest;
    }

    public void setWeeklyDigest(boolean weeklyDigest) {
        this.weeklyDigest = weeklyDigest;
    }
}