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

    @GetMapping("/get-list")
    public ResponseEntity<List<IssueDTO>> getList(@RequestParam long projectId,
                                              @RequestParam(required = false) Long sprintId,
                                              @RequestParam(required = false) Long epicId,
                                              @RequestParam String sortBy,
                                              @RequestParam String order,
                                              @ModelAttribute FilterParams filterParams) {
        return ResponseEntity.ok(issueService.getList(projectId, sprintId, epicId, sortBy, order, filterParams));
    }

    @GetMapping("/get")
    public ResponseEntity<IssueDTO> get(@RequestParam long projectId,
                                        @RequestParam long issueId){
        return ResponseEntity.ok(issueService.get(projectId, issueId));
    }

    @PostMapping("/add")
    public ResponseEntity<IssueDTO> create(@RequestParam long projectId,
                                        @RequestParam(required = false) Long sprintId,
                                        @RequestParam(required = false) Long epicId,
                                        @RequestBody @Valid AddIssueDTO dto) {
        return ResponseEntity.ok(issueService.add(
                projectId,
                sprintId,
                epicId,
                dto));
    }

    @PatchMapping("/{issueId}")
    public ResponseEntity<IssueDTO> update(@PathVariable long issueId,
                                           @RequestBody AddIssueDTO dto){
        return ResponseEntity.ok(issueService.update(issueId, dto));
    }

    @DeleteMapping("/{issueId}")
    public ResponseEntity<Void> delete(@PathVariable long issueId) {
        issueService.delete(issueId);
        return ResponseEntity.ok().build();
    }

}
