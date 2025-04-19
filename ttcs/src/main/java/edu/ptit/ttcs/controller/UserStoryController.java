package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.response.UserStoryDTO;
import edu.ptit.ttcs.service.UserStoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user_story")
public class UserStoryController {

    private final UserStoryService userStoryService;

    @GetMapping("/get")
    public ResponseEntity<List<UserStoryDTO>> get(@RequestParam long projectId,
                                                  @RequestParam(required = false) Long sprintId){
        return ResponseEntity.ok(userStoryService.get(projectId, sprintId));
    }

}
