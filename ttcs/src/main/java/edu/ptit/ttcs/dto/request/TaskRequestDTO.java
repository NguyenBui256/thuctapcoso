package edu.ptit.ttcs.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequestDTO {
    private String name;
    private String description;
    private Long userId;
    private Long userStoryId;
    private LocalDateTime dueDate;
    private Long statusId;
    private Boolean isBlocked;
}