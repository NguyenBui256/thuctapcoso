package edu.ptit.ttcs.entity.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PermissionDTO {

    private long id;

    private String name;

    private Boolean isEnabled;

}
