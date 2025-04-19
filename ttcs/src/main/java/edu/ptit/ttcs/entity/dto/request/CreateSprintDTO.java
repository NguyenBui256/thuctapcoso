package edu.ptit.ttcs.entity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
public class CreateSprintDTO {

    @NotBlank(message = "ProjectId cannot be empty")
    private long projectId;

    @NotBlank(message = "Sprint's name cannot be empty")
    private String name;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

}
