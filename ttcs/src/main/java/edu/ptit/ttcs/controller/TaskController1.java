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
public class TaskController1 {

    private final TaskService taskService;

    @GetMapping("/get_by_sprint")
    public ResponseEntity<List<TaskDTO>> getBySprint(@RequestParam long projectId,
                                                     @RequestParam long sprintId,
                                                     @ModelAttribute FilterParams filterParams) {
        return ResponseEntity.ok(taskService.getBySprint(projectId, sprintId,
                filterParams));
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
                                                 @ModelAttribute FilterParams filterParams){
        return ResponseEntity.ok(taskService.getFilterData(projectId,
                filterParams));
    }


}
