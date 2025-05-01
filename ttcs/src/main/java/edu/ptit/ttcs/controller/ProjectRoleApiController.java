package edu.ptit.ttcs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.ptit.ttcs.dao.ProjectRoleRepository;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.dto.ProjectRoleDTO;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/project-roles")
@CrossOrigin(origins = "http://localhost:5173", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class ProjectRoleApiController {

    @Autowired
    private ProjectRoleRepository projectRoleRepository;

    /**
     * Get all project roles for a specific project
     * 
     * @param projectId The project ID
     * @return List of project roles
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectRoleDTO>> getProjectRoles(@PathVariable Long projectId) {
        try {
            List<ProjectRole> roles = projectRoleRepository.findByProjectId(projectId);

            List<ProjectRoleDTO> roleDTOs;

            // Nếu không có dữ liệu trong DB, tạo dữ liệu mẫu
            if (roles == null || roles.isEmpty()) {
                // Tạo dữ liệu mẫu dựa trên ảnh ví dụ
                roleDTOs = createSampleRoles(projectId);
            } else {
                // Nếu có dữ liệu, sử dụng dữ liệu từ DB
                roleDTOs = roles.stream()
                        .map(role -> {
                            ProjectRoleDTO dto = new ProjectRoleDTO();
                            dto.setId(role.getId());
                            dto.setProjectId(projectId);
                            dto.setRoleName(role.getRoleName());
                            return dto;
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(roleDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Tạo dữ liệu mẫu cho roles dựa trên ảnh ví dụ
     */
    private List<ProjectRoleDTO> createSampleRoles(Long projectId) {
        List<ProjectRoleDTO> sampleRoles = new ArrayList<>();

        // Tạo các role từ ảnh ví dụ: Front, Back, Product Owner, Stakeholder
        ProjectRoleDTO frontRole = new ProjectRoleDTO();
        frontRole.setId(1L);
        frontRole.setProjectId(projectId);
        frontRole.setRoleName("Front");
        sampleRoles.add(frontRole);

        ProjectRoleDTO backRole = new ProjectRoleDTO();
        backRole.setId(2L);
        backRole.setProjectId(projectId);
        backRole.setRoleName("Back");
        sampleRoles.add(backRole);

        ProjectRoleDTO poRole = new ProjectRoleDTO();
        poRole.setId(3L);
        poRole.setProjectId(projectId);
        poRole.setRoleName("Product Owner");
        sampleRoles.add(poRole);

        ProjectRoleDTO stakeholderRole = new ProjectRoleDTO();
        stakeholderRole.setId(4L);
        stakeholderRole.setProjectId(projectId);
        stakeholderRole.setRoleName("Stakeholder");
        sampleRoles.add(stakeholderRole);

        return sampleRoles;
    }
}