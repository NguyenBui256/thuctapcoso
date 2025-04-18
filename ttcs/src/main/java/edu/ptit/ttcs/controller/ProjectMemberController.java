package edu.ptit.ttcs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.ptit.ttcs.entity.dto.PointsUpdateRequestDTO;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import edu.ptit.ttcs.entity.dto.ProjectMemberRequestDTO;
import edu.ptit.ttcs.service.ProjectMemberService;
import edu.ptit.ttcs.util.ApiResponse;

@RestController
@RequestMapping("/api/v1/user/{userId}/project/{projectId}/members")
public class ProjectMemberController {

    @Autowired
    private ProjectMemberService projectMemberService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectMemberDTO>> addMember(
            @PathVariable Long projectId,
            @RequestBody ProjectMemberRequestDTO request,
            @PathVariable Long userId) {
        try {
            request.validate();
            ProjectMemberDTO member = projectMemberService.addMemberToProject(
                    projectId,
                    request.getUserId(),
                    request.getRoleId(),
                    request.getIsAdmin(),
                    userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Member added successfully", member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<List<ProjectMemberDTO>> getProjectMembers(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        try {
            List<ProjectMemberDTO> members = projectMemberService.getProjectMembers(projectId, userId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<ProjectMemberDTO> updateMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody ProjectMemberRequestDTO request,
            @PathVariable Long userId) {
        try {
            request.validate();
            ProjectMemberDTO member = projectMemberService.updateProjectMember(
                    projectId,
                    memberId,
                    request.getRoleId(),
                    request.getIsAdmin(),
                    userId);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @PathVariable Long userId) {
        try {
            projectMemberService.removeProjectMember(projectId, memberId, userId);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{memberId}/points")
    public ResponseEntity<Void> updateMemberPoints(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody PointsUpdateRequestDTO request,
            @PathVariable Long userId) {
        try {
            request.validate();
            projectMemberService.updateMemberPoints(
                    projectId,
                    memberId,
                    request.getPoints(),
                    userId);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}