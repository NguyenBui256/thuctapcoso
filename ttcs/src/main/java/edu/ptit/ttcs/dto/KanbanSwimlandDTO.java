package edu.ptit.ttcs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class KanbanSwimlandDTO {

    private Integer id;
    private String name;
    private Integer order;
    private String status;
    private Integer projectId;
}