package edu.ptit.ttcs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserSettings;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.UserSettingsRepository;
import edu.ptit.ttcs.entity.dto.UserDTO;
import edu.ptit.ttcs.service.UserService;
import edu.ptit.ttcs.util.SecurityUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.dto.UserStorySimpleDTO;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User user1 = securityUtils.getCurrentUser();
        Optional<UserSettings> userSettings = userSettingsRepository.findByUser(user1);
        System.out.println(userSettings.get().getBio());
        String bio = userSettings.get().getBio();
        return userRepository.findById(id)
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(user.getId());
                    dto.setUsername(user.getUsername());
                    dto.setFullName(user.getFullName());
                    dto.setBio(bio);
                    dto.setClosedUserStories(userService.getClosedUserStoriesCountByUserId(id));
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/contacts")
    public ResponseEntity<List<UserDTO>> getUserContacts(@PathVariable Long id) {
        List<UserDTO> contacts = userService.getContactsByUserId(id)
                .stream().map(UserDTO::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}/assigned-userstories")
    public ResponseEntity<List<UserStorySimpleDTO>> getAssignedUserStories(@PathVariable Long id) {
        List<UserStory> stories = userService.getAssignedUserStoriesByUserId(id);
        List<UserStorySimpleDTO> dtos = stories.stream()
                .map(us -> new UserStorySimpleDTO(
                        us.getId(),
                        us.getName(),
                        us.getStatus() != null ? us.getStatus().getName() : null,
                        us.getStatus() != null ? us.getStatus().getClosed() : null,
                        us.getProject() != null ? us.getProject().getId() : null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}