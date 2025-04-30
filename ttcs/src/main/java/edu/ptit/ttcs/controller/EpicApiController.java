package edu.ptit.ttcs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.ptit.ttcs.dao.EpicRepository;
import edu.ptit.ttcs.entity.Epic;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/epics")
@CrossOrigin(origins = "http://localhost:5173", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class EpicApiController {

    @Autowired
    private EpicRepository epicRepository;

    /**
     * Get all epics for a specific project
     * 
     * @param projectId The project ID
     * @return List of epics
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Map<String, Object>>> getProjectEpics(@PathVariable Long projectId) {
        try {
            List<Epic> epics = epicRepository.findByProjectId(projectId);
            List<Map<String, Object>> epicDTOs;

            // Nếu không có dữ liệu trong DB, tạo dữ liệu mẫu
            if (epics == null || epics.isEmpty()) {
                epicDTOs = createSampleEpics(projectId);
            } else {
                // Sử dụng dữ liệu từ DB nếu có
                epicDTOs = epics.stream()
                        .map(epic -> {
                            Map<String, Object> epicMap = new HashMap<>();
                            epicMap.put("id", epic.getId());
                            epicMap.put("name", epic.getSubject());
                            epicMap.put("description", epic.getDescription() != null ? epic.getDescription() : "");
                            epicMap.put("projectId", epic.getProject().getId());
                            epicMap.put("createdBy",
                                    epic.getCreatedBy() != null ? epic.getCreatedBy().getUsername() : "");
                            epicMap.put("createdAt",
                                    epic.getCreatedDate() != null ? epic.getCreatedDate().toString() : "");
                            return epicMap;
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(epicDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Tạo dữ liệu mẫu cho epics
     */
    private List<Map<String, Object>> createSampleEpics(Long projectId) {
        List<Map<String, Object>> sampleEpics = new ArrayList<>();

        // Epic 1: Cài đặt DB
        Map<String, Object> epic1 = new HashMap<>();
        epic1.put("id", 1L);
        epic1.put("name", "Cài đặt DB");
        epic1.put("description", "Thiết lập và cấu hình cơ sở dữ liệu");
        epic1.put("projectId", projectId);
        epic1.put("createdBy", "gaugau");
        epic1.put("createdAt", "2023-08-01T10:00:00");
        sampleEpics.add(epic1);

        // Epic 2: Not in an epic (để phù hợp với ảnh ví dụ)
        Map<String, Object> epic2 = new HashMap<>();
        epic2.put("id", "no-epic");
        epic2.put("name", "Not in an epic");
        epic2.put("description", "Tasks không thuộc epic nào");
        epic2.put("projectId", projectId);
        epic2.put("createdBy", "");
        epic2.put("createdAt", "");
        sampleEpics.add(epic2);

        return sampleEpics;
    }
}