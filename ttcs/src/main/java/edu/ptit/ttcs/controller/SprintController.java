package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Sprint;
import edu.ptit.ttcs.entity.dto.request.CreateSprintDTO;
import edu.ptit.ttcs.entity.dto.response.SprintDTO;
import edu.ptit.ttcs.service.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<SprintDTO> create(@RequestBody @Valid CreateSprintDTO dto) {
        return ResponseEntity.ok(sprintService.createSprint(dto));
    }



}
