package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dto.KanbanSwimlandDTO;
import edu.ptit.ttcs.service.KanbanSwimlandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanban-swimlands")
public class KanbanSwimlandController {

    @Autowired
    private KanbanSwimlandService kanbanSwimlandService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<KanbanSwimlandDTO>> getSwimlandsByProject(@PathVariable Integer projectId) {
        return ResponseEntity.ok(kanbanSwimlandService.getSwimlandsByProject(projectId));
    }

    @GetMapping("/{swimlandId}")
    public ResponseEntity<KanbanSwimlandDTO> getSwimlandById(@PathVariable Integer swimlandId) {
        return ResponseEntity.ok(kanbanSwimlandService.getSwimlandById(swimlandId));
    }

    @PostMapping
    public ResponseEntity<KanbanSwimlandDTO> createSwimland(@RequestBody KanbanSwimlandDTO swimlandDTO) {
        KanbanSwimlandDTO createdSwimland = kanbanSwimlandService.createSwimland(swimlandDTO);
        return new ResponseEntity<>(createdSwimland, HttpStatus.CREATED);
    }

    @PutMapping("/{swimlandId}")
    public ResponseEntity<KanbanSwimlandDTO> updateSwimland(
            @PathVariable Integer swimlandId,
            @RequestBody KanbanSwimlandDTO swimlandDTO) {
        return ResponseEntity.ok(kanbanSwimlandService.updateSwimland(swimlandId, swimlandDTO));
    }

    @DeleteMapping("/{swimlandId}")
    public ResponseEntity<Void> deleteSwimland(@PathVariable Integer swimlandId) {
        kanbanSwimlandService.deleteSwimland(swimlandId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/project/{projectId}/reorder")
    public ResponseEntity<Void> reorderSwimlands(
            @PathVariable Integer projectId,
            @RequestBody List<Integer> swimlandIds) {
        kanbanSwimlandService.reorderSwimlands(projectId, swimlandIds);
        return ResponseEntity.ok().build();
    }
}