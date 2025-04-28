package edu.ptit.ttcs.entity.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class SprintDTO {

    private long id;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private int closed;

    private int total;

    private List<UserStoryDTO> userStories;

}
