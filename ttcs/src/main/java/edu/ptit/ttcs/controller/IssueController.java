package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.FilterData;
import edu.ptit.ttcs.entity.dto.response.IssueDTO;
import edu.ptit.ttcs.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/issue")
public class IssueController {

    private final IssueService issueService;

    @GetMapping("/get-filters")
    public ResponseEntity<FilterData> getFilters(@RequestParam long projectId) {
        return ResponseEntity.ok(
                issueService.getFilters(projectId,
                    FilterParams.builder()
                        .build())
        );
    }

    @GetMapping("/get")
    public ResponseEntity<List<IssueDTO>> get(@RequestParam long projectId,
                                              @RequestParam(required = false) long sprintId){

        return null;
    }

}
