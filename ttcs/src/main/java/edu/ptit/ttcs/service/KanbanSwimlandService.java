package edu.ptit.ttcs.service;

import edu.ptit.ttcs.entity.dto.KanbanSwimlandDTO;
import edu.ptit.ttcs.entity.KanbanSwimland;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.dao.KanbanSwimlandDAO;
import edu.ptit.ttcs.dao.ProjectDAO;
import edu.ptit.ttcs.dao.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.dao.ProjectMemberRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KanbanSwimlandService {

    @Autowired
    private KanbanSwimlandDAO kanbanSwimlandDAO;

    @Autowired
    private ProjectDAO projectDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    public List<KanbanSwimlandDTO> getSwimlandsByProject(Integer projectId) {
        List<KanbanSwimland> swimlands = kanbanSwimlandDAO.findByProjectIdOrderByOrder(projectId);
        return swimlands.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public KanbanSwimlandDTO getSwimlandById(Integer swimlandId) {
        KanbanSwimland swimland = getSwimlandEntityById(swimlandId);
        return convertToDTO(swimland);
    }

    @Transactional
    public KanbanSwimlandDTO createSwimland(KanbanSwimlandDTO swimlandDTO) {
        KanbanSwimland swimland = new KanbanSwimland();
        updateSwimlandFromDTO(swimland, swimlandDTO);

        // Set order to be last in project
        List<KanbanSwimland> projectSwimlands = kanbanSwimlandDAO
                .findByProjectIdOrderByOrder(swimlandDTO.getProjectId());
        int maxOrder = projectSwimlands.isEmpty() ? 0
                : projectSwimlands.stream().mapToInt(KanbanSwimland::getOrder).max().orElse(0);
        swimland.setOrder(maxOrder + 1);

        KanbanSwimland savedSwimland = kanbanSwimlandDAO.save(swimland);
        return convertToDTO(savedSwimland);
    }

    @Transactional
    public KanbanSwimlandDTO updateSwimland(Integer swimlandId, KanbanSwimlandDTO swimlandDTO) {
        KanbanSwimland swimland = getSwimlandEntityById(swimlandId);
        updateSwimlandFromDTO(swimland, swimlandDTO);
        KanbanSwimland updatedSwimland = kanbanSwimlandDAO.save(swimland);
        return convertToDTO(updatedSwimland);
    }

    @Transactional
    public void deleteSwimland(Integer swimlandId) {
        kanbanSwimlandDAO.deleteById(swimlandId);
    }

    @Transactional
    public void reorderSwimlands(Integer projectId, List<Integer> swimlandIds) {
        for (int i = 0; i < swimlandIds.size(); i++) {
            KanbanSwimland swimland = getSwimlandEntityById(swimlandIds.get(i));
            swimland.setOrder(i + 1);
            kanbanSwimlandDAO.save(swimland);
        }
    }

    // Helper method to get entity by ID for other services
    public KanbanSwimland getSwimlandEntityById(Integer swimlandId) {
        return kanbanSwimlandDAO.findById(swimlandId)
                .orElseThrow(() -> new RuntimeException("Swimland not found with id " + swimlandId));
    }

    private void updateSwimlandFromDTO(KanbanSwimland swimland, KanbanSwimlandDTO dto) {
        swimland.setName(dto.getName());
        swimland.setStatus(dto.getStatus());

        // Nếu là entity mới (chưa có ID), thiết lập created_at và created_by
        if (swimland.getId() == null) {
            swimland.setCreatedAt(LocalDateTime.now());
            swimland.setUpdatedAt(LocalDateTime.now());

            // Lấy thông tin người dùng hiện tại từ Spring Security
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication != null ? authentication.getName() : "system";

            // Tìm đối tượng User từ username
            User currentUser = userDAO.findByUsername(currentUsername)
                    .orElseGet(() -> {
                        // Nếu không tìm thấy user, sử dụng một user mặc định hoặc null
                        User systemUser = new User();
                        systemUser.setId(1L); // ID của user mặc định/system, điều chỉnh theo cơ sở dữ liệu của bạn
                        return systemUser;
                    });

            // Fix: Use findByUserAndIsDeleteFalse instead of findByUserId
            List<ProjectMember> projectMembers = projectMemberRepository.findByUserAndIsDeleteFalse(currentUser);
            ProjectMember currentProjectMember = projectMembers.isEmpty() ? null : projectMembers.get(0);

            if (currentProjectMember == null) {
                throw new RuntimeException("Project member not found with user id " + currentUser.getId());
            }

            swimland.setCreatedBy(currentProjectMember);
            swimland.setUpdatedBy(currentProjectMember);
        } else {
            // Nếu đang cập nhật entity đã tồn tại, chỉ cập nhật updated_at và updated_by
            swimland.setUpdatedAt(LocalDateTime.now());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication != null ? authentication.getName() : "system";

            // Tìm đối tượng User từ username
            User currentUser = userDAO.findByUsername(currentUsername)
                    .orElseGet(() -> {
                        // Nếu không tìm thấy user, sử dụng một user mặc định hoặc null
                        User systemUser = new User();
                        systemUser.setId(1L);
                        return systemUser;
                    });

            // Fix: Use findByUserAndIsDeleteFalse instead of using swimland's project
            // member directly
            List<ProjectMember> projectMembers = projectMemberRepository.findByUserAndIsDeleteFalse(currentUser);
            ProjectMember currentProjectMember = projectMembers.isEmpty()
                    ? (swimland.getUpdatedBy() != null ? swimland.getUpdatedBy() : swimland.getCreatedBy())
                    : projectMembers.get(0);

            swimland.setUpdatedBy(currentProjectMember);
        }

        if (dto.getOrder() != null) {
            swimland.setOrder(dto.getOrder());
        }

        if (dto.getProjectId() != null) {
            Project project = projectDAO.findById(dto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found with id " + dto.getProjectId()));
            swimland.setProject(project);
        }
    }

    private KanbanSwimlandDTO convertToDTO(KanbanSwimland swimland) {
        KanbanSwimlandDTO dto = new KanbanSwimlandDTO();
        dto.setId(swimland.getId());
        dto.setName(swimland.getName());
        dto.setOrder(swimland.getOrder());
        dto.setStatus(swimland.getStatus());

        if (swimland.getProject() != null) {
            dto.setProjectId(swimland.getProject().getId().intValue());
        }

        // dto.setCreatedAt(swimland.getCreatedAt());
        // dto.setUpdatedAt(swimland.getUpdatedAt());

        return dto;
    }
}