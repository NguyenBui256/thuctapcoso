package edu.ptit.ttcs.entity.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SprintProgressDTO {

    private int totalTasks;

    private int completedTasks;

    private int totalSprints;

    private double averageTaskPerSprint;

}
