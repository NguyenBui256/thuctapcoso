package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.RoleRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Role;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.enums.RoleName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
        return roleRepository.findByName(name.toString()).orElse(null);
    }

    public String getRandomUserDefaultAvatar() {
        Random random = new Random();
        int x = random.nextInt(5) + 1;
        int r, g, b;
        do {
            r = random.nextInt(156) + 50;
            g = random.nextInt(156) + 50;
            b = random.nextInt(156) + 50;
        } while (isTooDark(r, g, b) || isTooBright(r, g, b));
        String hexColor = String.format("%02X%02X%02X", r, g, b);
        return "0" + x + "." + hexColor;
    }

    private static boolean isTooDark(int r, int g, int b) {
        return (r + g + b) / 3 < 60; // Nếu độ sáng trung bình dưới 60, quá tối
    }

    private static boolean isTooBright(int r, int g, int b) {
        return (r + g + b) / 3 > 200; // Nếu độ sáng trung bình trên 200, quá sáng
    }

}
