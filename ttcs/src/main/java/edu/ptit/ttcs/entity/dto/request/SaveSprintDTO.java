package edu.ptit.ttcs.entity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateSprintDTO {

    @NotNull(message = "ProjectId cannot be empty")
    private long projectId;

    @NotBlank(message = "Sprint's name cannot be empty")
    private String name;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

}
