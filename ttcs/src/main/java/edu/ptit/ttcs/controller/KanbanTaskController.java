package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dto.KanbanTaskDTO;
import edu.ptit.ttcs.service.KanbanTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kanban-tasks")
public class KanbanTaskController {

    @Autowired
    private KanbanTaskService kanbanTaskService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<KanbanTaskDTO>> getAllTasksByProject(@PathVariable Integer projectId) {
        return ResponseEntity.ok(kanbanTaskService.getAllTasksByProject(projectId));
    }

    @GetMapping("/swimland/{swimlandId}")
    public ResponseEntity<List<KanbanTaskDTO>> getTasksBySwimland(@PathVariable Integer swimlandId) {
        return ResponseEntity.ok(kanbanTaskService.getTasksBySwimland(swimlandId));
    }

    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<KanbanTaskDTO>> getTasksByStatus(
            @PathVariable Integer projectId,
            @PathVariable String status) {
        return ResponseEntity.ok(kanbanTaskService.getTasksByStatus(projectId, status));
    }

    @PostMapping
    public ResponseEntity<KanbanTaskDTO> createTask(@RequestBody KanbanTaskDTO taskDTO) {
        KanbanTaskDTO createdTask = kanbanTaskService.createTask(taskDTO);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<KanbanTaskDTO> updateTask(
            @PathVariable Integer taskId,
            @RequestBody KanbanTaskDTO taskDTO) {
        return ResponseEntity.ok(kanbanTaskService.updateTask(taskId, taskDTO));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer taskId) {
        kanbanTaskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Void> updateTaskStatus(
            @PathVariable Integer taskId,
            @RequestBody Map<String, Object> request) {
        String status = (String) request.get("status");
        Integer swimlandId = (Integer) request.get("swimlandId");
        kanbanTaskService.updateTaskStatus(taskId, status, swimlandId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/swimland/{swimlandId}/reorder")
    public ResponseEntity<Void> reorderTasks(
            @PathVariable Integer swimlandId,
            @RequestBody List<Integer> taskIds) {
        kanbanTaskService.reorderTasks(swimlandId, taskIds);
        return ResponseEntity.ok().build();
    }
}