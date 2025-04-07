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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.ptit.ttcs.dto.PointsUpdateRequestDTO;
import edu.ptit.ttcs.dto.ProjectMemberDTO;
import edu.ptit.ttcs.dto.ProjectMemberRequestDTO;
import edu.ptit.ttcs.service.ProjectMemberService;
import edu.ptit.ttcs.util.ApiResponse;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
public class ProjectMemberController {

    @Autowired
    private ProjectMemberService projectMemberService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectMemberDTO>> addMember(
            @PathVariable Long projectId,
            @RequestBody ProjectMemberRequestDTO request,
            @RequestHeader("User-Id") Long userId) {
        try {
            request.validate();
            ProjectMemberDTO member = projectMemberService.addMemberToProject(
                projectId, 
                request.getUserId(), 
                request.getRoleId(), 
                request.getIsAdmin(), 
                userId
            );
            return ResponseEntity.ok(new ApiResponse<>("success", "Member added successfully", member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectMemberDTO>>> getProjectMembers(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ProjectMemberDTO> members = projectMemberService.getProjectMembers(projectId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project members retrieved successfully", members));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<ApiResponse<ProjectMemberDTO>> updateMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody ProjectMemberRequestDTO request,
            @RequestHeader("User-Id") Long userId) {
        try {
            request.validate();
            ProjectMemberDTO member = projectMemberService.updateProjectMember(
                projectId, 
                memberId, 
                request.getRoleId(), 
                request.getIsAdmin(), 
                userId
            );
            return ResponseEntity.ok(new ApiResponse<>("success", "Member updated successfully", member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestHeader("User-Id") Long userId) {
        try {
            projectMemberService.removeProjectMember(projectId, memberId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Member removed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PutMapping("/{memberId}/points")
    public ResponseEntity<ApiResponse<Void>> updateMemberPoints(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody PointsUpdateRequestDTO request,
            @RequestHeader("User-Id") Long userId) {
        try {
            request.validate();
            projectMemberService.updateMemberPoints(
                projectId, 
                memberId, 
                request.getPoints(), 
                userId
            );
            return ResponseEntity.ok(new ApiResponse<>("success", "Member points updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
} 