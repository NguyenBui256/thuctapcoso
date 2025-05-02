package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dto.request.AddIssueDTO;
import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.FilterData;
import edu.ptit.ttcs.entity.dto.response.IssueDTO;
import edu.ptit.ttcs.service.facade.IssueFacadeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/issue")
public class IssueController {

    private final IssueFacadeService issueService;

    @GetMapping("/get-filters")
    public ResponseEntity<FilterData> getFilters(@RequestParam long projectId,
                                                 @ModelAttribute FilterParams filterParams) {
        return ResponseEntity.ok(
                issueService.getFilters(projectId,
                    filterParams)
        );
    }

    @GetMapping("/get")
    public ResponseEntity<List<IssueDTO>> get(@RequestParam long projectId,
                                              @RequestParam(required = false) Long sprintId,
                                              @RequestParam(required = false) Long epicId,
                                              @RequestParam String sortBy,
                                              @RequestParam String order,
                                              @ModelAttribute FilterParams filterParams) {
        return ResponseEntity.ok(issueService.get(projectId, sprintId, epicId, sortBy, order, filterParams));
    }

    @PostMapping("/add")
    public ResponseEntity<IssueDTO> add(@RequestParam long projectId,
                                        @RequestParam(required = false) Long sprintId,
                                        @RequestParam(required = false) Long epicId,
                                        @RequestBody @Valid AddIssueDTO dto) {
        return ResponseEntity.ok(issueService.add(
                projectId,
                sprintId,
                epicId,
                dto));
    }

}
