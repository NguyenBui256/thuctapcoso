package edu.ptit.ttcs.entity.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class PjRoleDTO {

    private long id;

    private String name;

    private List<PermissionDTO> permissions = new ArrayList<>();

}
