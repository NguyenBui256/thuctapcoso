package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.RoleRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.UserStoryRepository;
import edu.ptit.ttcs.entity.Role;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.enums.RoleName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserStoryRepository userStoryRepository;

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    private final RoleRepository roleRepository;

    public User saveUser(User user) {
        user.setEmail(user.getEmail().toLowerCase());
        return userRepository.save(user);
    }

    public User getUserByLogin(String login) {
        return userRepository.findByUsernameOrEmail(login).orElse(null);
    }

    public User getUserByLogin(String username, String email) {
        email = email.toLowerCase();
        return userRepository.findByUsernameOrEmail(username, email).orElse(null);
    }

    public boolean existByEmail(String email) {
        email = email.toLowerCase();
        return userRepository.existsByEmail(email);
    }

    public List<User> getAllUsersHasUsernameStartWith(String prefix) {
        return userRepository.findAllByUsernameStartsWith(prefix);
    }

    public boolean isUserExist(String username, String email) {
        return userRepository.existsByUsernameOrEmail(username, email);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Role getRoleByName(RoleName name) {
        return roleRepository.findByName(name.toString())
                .orElseThrow(() -> new RuntimeException("Role " + name + " not found"));
    }

    public String getRandomUserDefaultAvatar() {
        // Generate a random background color that's not too dark or too bright
        Random random = new Random();
        int r, g, b;
        do {
            r = random.nextInt(256);
            g = random.nextInt(256);
            b = random.nextInt(256);
        } while (isTooDark(r, g, b) || isTooBright(r, g, b));

        String hexColor = String.format("%02x%02x%02x", r, g, b);
        return "https://ui-avatars.com/api/?background=" + hexColor + "&color=ffffff";
    }

    private static boolean isTooDark(int r, int g, int b) {
        return (r + g + b) / 3 < 60; // Nếu độ sáng trung bình dưới 60, quá tối
    }

    private static boolean isTooBright(int r, int g, int b) {
        return (r + g + b) / 3 > 200; // Nếu độ sáng trung bình trên 200, quá sáng
    }

    public List<User> getContactsByUserId(Long userId) {
        return projectMemberRepository.findContactsByUserId(userId);
    }

    public int getClosedUserStoriesCountByUserId(Long userId) {
        return userStoryRepository.countClosedUserStoriesByUserId(userId);
    }

    public List<UserStory> getAssignedUserStoriesByUserId(Long userId) {
        return userStoryRepository.findAssignedUserStoriesByUserId(userId);
    }

}
