package edu.ptit.ttcs.entity.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PjStatusDTO {

    private int id;

    private int order;

    private String type;

    private String color;

    private String name;

    private String slug;

    private boolean closed;

    private boolean archived;

}
