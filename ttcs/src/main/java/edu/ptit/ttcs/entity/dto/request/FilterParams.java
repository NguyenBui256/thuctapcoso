package edu.ptit.ttcs.entity.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Getter
@Setter
@Builder
public class FilterParams {

    private String keyword;

    private List<Long> statuses;

    private List<Long> tags;

    private List<Long> assigns;

    private List<Long> createdBy;

    private List<Long> roles;

    private List<Long> excludeStatuses;

    private List<Long> excludeTags;

    private List<Long> excludeAssigns;

    private List<Long> excludeCreatedBy;

    private List<Long> excludeRoles;

}
