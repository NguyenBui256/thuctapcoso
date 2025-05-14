package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.dto.response.*;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectSettingServiceT {

    private final PjSettingStatusRepository pjSettingStatusRepository;

    private final ProjectSettingTagRepository pjSettingTagRepository;

    private final PjSettingTypeRepository pjSettingTypeRepository;

    private final PjSettingSeverityRepository pjSettingSeverityRepository;

    private final PjSettingPriorityRepository pjSettingPriorityRepository;

    public ProjectSettingType getTypeById(int id){
        return pjSettingTypeRepository.findById(id)
                .orElseThrow(() -> new RequestException("Type not found"));
    }

    public ProjectSettingStatus getStatusById(int id){
        return pjSettingStatusRepository.findById(id)
                .orElseThrow(() -> new RequestException("Status not found"));
    }

    public ProjectSettingTag getTagById(Long id){
        return pjSettingTagRepository.findById(id)
                .orElseThrow(() -> new RequestException("Tag not found"));
    }

    public ProjectSettingSeverity getSeverityById(int id){
        return pjSettingSeverityRepository.findById(id)
                .orElseThrow(() -> new RequestException("Severity not found"));
    }
    public ProjectSettingPriority getPrioById(int id){
        return pjSettingPriorityRepository.findById(id)
                .orElseThrow(() -> new RequestException("Priority not found"));
    }


    public List<ProjectSettingTag> getAllTagByProject(Project project) {
        return pjSettingTagRepository.findAllByProject(project);
    }

    public List<ProjectSettingStatus> getAllStatusByProject(Project project, String type) {
        return pjSettingStatusRepository.findAllByProjectAndType(project, type);
    }

    public List<ProjectSettingType> getAllTypeByProject(Project project) {
        return pjSettingTypeRepository.findAllByProject(project);
    }

    public List<ProjectSettingSeverity> getAllSeverityByProject(Project project) {
        return pjSettingSeverityRepository.findAllByProject(project);
    }

    public List<ProjectSettingPriority> getAllPrioByProject(Project project) {
        return pjSettingPriorityRepository.findAllByProject(project);
    }

    public PjTagDTO toDTO(ProjectSettingTag tag){
        return ModelMapper.getInstance().map(tag, PjTagDTO.class);
    }

    public PjStatusDTO toDTO(ProjectSettingStatus status){
        return ModelMapper.getInstance().map(status, PjStatusDTO.class);
    }

    public PjTypeDTO toDTO(ProjectSettingType type){
        return ModelMapper.getInstance().map(type, PjTypeDTO.class);
    }

    public PjSeverityDTO toDTO(ProjectSettingSeverity sev){
        return ModelMapper.getInstance().map(sev, PjSeverityDTO.class);
    }

    public PjPriorityDTO toDTO(ProjectSettingPriority prio){
        return ModelMapper.getInstance().map(prio, PjPriorityDTO.class);
    }


}
