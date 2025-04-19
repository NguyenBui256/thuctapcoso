package edu.ptit.ttcs.entity.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class SprintDTO {

    private long id;

    private String name;

    private Date startDate;

    private Date endDate;

    private List<UserStoryDTO> userStories;

}
