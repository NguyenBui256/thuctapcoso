package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.request.SaveSprintDTO;
import edu.ptit.ttcs.entity.dto.response.SprintDTO;
import edu.ptit.ttcs.entity.dto.response.SprintProgressDTO;
import edu.ptit.ttcs.service.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/sprint")
public class SprintController {

    private final SprintService sprintService;

    @GetMapping("/get")
    public ResponseEntity<List<SprintDTO>> getByProject(@RequestParam long projectId,
                                                     @RequestParam boolean close) {
        return ResponseEntity.ok(sprintService.getAllByProject(projectId, close));
    }

    @PostMapping("/create")
    public ResponseEntity<SprintDTO> create(@RequestBody @Valid SaveSprintDTO dto) {
        return ResponseEntity.ok(sprintService.createSprint(dto));
    }

    @PostMapping("/update/{sprintId}")
    public ResponseEntity<SprintDTO> update(@PathVariable int sprintId,
                                            @RequestBody @Valid SaveSprintDTO dto) {
        return ResponseEntity.ok(sprintService.update(sprintId, dto));
    }

    @PostMapping("/delete/{sprintId}")
    public ResponseEntity<?> delete(@PathVariable int sprintId,
                                    @RequestParam long projectId) {
        sprintService.delete(sprintId, projectId);
        return ResponseEntity.ok().body(Map.of(
                "status", "success"
        ));
    }

    @GetMapping("/progress")
    public ResponseEntity<SprintProgressDTO> getProgress(@RequestParam long projectId){
        return ResponseEntity.ok(sprintService.getProgress(projectId));
    }

}
