package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.response.PjMemberDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectMemberServiceT {

    private final ProjectMemberRepository projectMemberRepository;

    private final ProjectRepository projectRepository;

    private final UserRepository userRepository;

    public ProjectMember getByProjectAndUser(Project project, User user) {
        return projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(project.getId(), user.getId());
    }

    public List<ProjectMember> getAllByProject(Project project) {
        return projectMemberRepository.findAllByProjectAndIsDeleteIsFalse(project);
    }

    public ProjectMember getById(long projectMemberId) {
        return projectMemberRepository.findByIdAndIsDeleteIsFalse(projectMemberId)
                .orElseThrow(() -> new RuntimeException("Project Member Not Found"));
    }

    public PjMemberDTO toDTO(ProjectMember member) {
        if(member == null) return null;
        PjMemberDTO dto = new PjMemberDTO();
        dto.setId(member.getId());
        dto.setAvatar(member.getUser().getAvatar());
        dto.setFullName(member.getUser().getFullName());
        dto.setUserId(member.getUser().getId());
        return dto;
    }

}
