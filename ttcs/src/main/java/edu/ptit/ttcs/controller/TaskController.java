package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.FilterData;
import edu.ptit.ttcs.entity.dto.response.TaskDTO;
import edu.ptit.ttcs.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/task")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/get_by_sprint")
    public ResponseEntity<List<TaskDTO>> getBySprint(@RequestParam long projectId,
                                                     @RequestParam long sprintId,
                                                     @RequestParam(required = false) String keyword,
                                                     @RequestParam(required = false) List<Long> statuses,
                                                     @RequestParam(required = false) List<Long> assigns,
                                                     @RequestParam(required = false) List<Long> createdBy,
                                                     @RequestParam(required = false) List<Long> roles,
                                                     @RequestParam(required = false) List<Long> excludeStatuses,
                                                     @RequestParam(required = false) List<Long> excludeAssigns,
                                                     @RequestParam(required = false) List<Long> excludeCreatedBy,
                                                     @RequestParam(required = false) List<Long> excludeRoles) {
        return ResponseEntity.ok(taskService.getBySprint(projectId, sprintId,
                FilterParams.builder()
                        .keyword(keyword)
                        .statuses(statuses)
                        .assigns(assigns)
                        .createdBy(createdBy)
                        .roles(roles)
                        .excludeStatuses(excludeStatuses)
                        .excludeAssigns(excludeAssigns)
                        .excludeCreatedBy(excludeCreatedBy)
                        .excludeRoles(excludeRoles)
                        .build()));
    }

    @PostMapping("/update_status/{taskId}")
    public ResponseEntity<?> updateStatus(@PathVariable int taskId,
                                            @RequestParam int statusId,
                                            @RequestParam int userStoryId) {
        taskService.updateStatus(taskId, statusId, userStoryId);
        return ResponseEntity.ok().body(Map.of(
                "status", "success"
        ));
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
        return ResponseEntity.ok(taskService.getFilterData(projectId,
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
