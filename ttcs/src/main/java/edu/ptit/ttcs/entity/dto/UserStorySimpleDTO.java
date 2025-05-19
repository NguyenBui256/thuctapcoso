package edu.ptit.ttcs.entity.dto;

public class UserStorySimpleDTO {
    private Integer id;
    private String name;
    private String statusName;
    private Boolean statusClosed;
    private Long projectId;

    public UserStorySimpleDTO(Integer id, String name, String statusName, Boolean statusClosed, Long projectId) {
        this.id = id;
        this.name = name;
        this.statusName = statusName;
        this.statusClosed = statusClosed;
        this.projectId = projectId;
    }

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

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }

    public Boolean getStatusClosed() {
        return statusClosed;
    }

    public void setStatusClosed(Boolean statusClosed) {
        this.statusClosed = statusClosed;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}