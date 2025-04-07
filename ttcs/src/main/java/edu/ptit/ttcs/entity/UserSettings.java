package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user_settings")
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String language = "en";
    private String theme = "light";
    private String bio;
    private String photoUrl;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    private boolean projectUpdates = true;
    private boolean taskUpdates = true;
    private boolean commentUpdates = true;
    private boolean mentionUpdates = true;
    private boolean deadlineReminders = true;
    private boolean weeklyDigest = true;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

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