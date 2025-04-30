package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.FilterData;
import edu.ptit.ttcs.entity.dto.response.UserStoryDTO;
import edu.ptit.ttcs.service.UserStoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user_story")
public class UserStoryController {

    private final UserStoryService userStoryService;

    @GetMapping("/get")
    public ResponseEntity<List<UserStoryDTO>> get(@RequestParam long projectId,
                                                  @RequestParam(required = false) Long sprintId,
                                                  @ModelAttribute FilterParams filterParams) {
        return ResponseEntity.ok(userStoryService.get(projectId,
                sprintId,
                filterParams));
    }

    @GetMapping("/get-filters")
    public ResponseEntity<FilterData> getFilters(@RequestParam long projectId,
                                                 @RequestParam(required = false) List<Long> statuses,
                                                 @RequestParam(required = false) List<Long> assigns,
                                                 @RequestParam(required = false) List<Long> createdBy,
                                                 @RequestParam(required = false) List<Long> roles,
                                                 @RequestParam(required = false) List<Long> excludeStatuses,
                                                 @RequestParam(required = false) List<Long> excludeAssigns,
                                                 @RequestParam(required = false) List<Long> excludeCreatedBy,
                                                 @RequestParam(required = false) List<Long> excludeRoles){
        return ResponseEntity.ok(userStoryService.getFilterData(projectId,
                FilterParams.builder()
                        .statuses(statuses)
                        .assigns(assigns)
                        .roles(roles)
                        .createdBy(createdBy)
                        .excludeAssigns(excludeAssigns)
                        .excludeCreatedBy(excludeCreatedBy)
                        .excludeRoles(excludeRoles)
                        .excludeStatuses(excludeStatuses)
                        .build()));
    }

}
