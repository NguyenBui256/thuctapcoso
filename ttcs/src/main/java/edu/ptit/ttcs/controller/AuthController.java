package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.common.Constant;
import edu.ptit.ttcs.entity.dto.request.ForgotPasswordDTO;
import edu.ptit.ttcs.entity.dto.request.LoginDTO;
import edu.ptit.ttcs.entity.dto.request.RegistrationDTO;
import edu.ptit.ttcs.entity.dto.request.ResetPasswordDTO;
import edu.ptit.ttcs.entity.dto.response.AuthResponse;
import edu.ptit.ttcs.service.facade.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import edu.ptit.ttcs.dao.RoleRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Role;
import edu.ptit.ttcs.entity.User;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

        private final AuthService authService;

        private final Constant constant;

        private final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

        private final AuthenticationManagerBuilder authenticationManagerBuilder;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private RoleRepository roleRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegistrationDTO registrationDTO) {
                try {
                        // Check if username or email already exists
                        if (userRepository.existsByUsernameOrEmail(registrationDTO.getUsername(),
                                        registrationDTO.getEmail())) {
                                return ResponseEntity.badRequest().body("Username or email already exists");
                        }

                        // Create new user
                        User user = new User();
                        user.setUsername(registrationDTO.getUsername());
                        user.setEmail(registrationDTO.getEmail());
                        user.setFullName(registrationDTO.getFullName());
                        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
                        user.setBio(registrationDTO.getBio());
                        user.setAvatar(registrationDTO.getAvatar());

                        // Set created_at to current time
                        user.setCreatedAt(LocalDateTime.now());

                        // Get or create USER role
                        Role role = roleRepository.findByName("USER")
                                        .orElseGet(() -> {
                                                Role newRole = new Role();
                                                newRole.setName("USER");
                                                newRole.setDescription("Regular user role");
                                                newRole.setActive(true);
                                                return roleRepository.save(newRole);
                                        });
                        user.setRole(role);

                        // Save user
                        userRepository.save(user);

                        return ResponseEntity.ok("User registered successfully");
                } catch (Exception e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody @Valid LoginDTO dto) {
                AuthResponse res = authService.login(dto, false);
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                                dto.getLogin(), dto.getPassword());
                Authentication authentication = authenticationManagerBuilder.getObject()
                                .authenticate(authenticationToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, getRefreshTokenCookie(res.getRefreshToken()).toString())
                                .body(Map.of(
                                                "token", res.getAccessToken()));
        }

        @PostMapping("/oauth")
        public ResponseEntity<?> oauth2Login(@RequestParam String provider,
                        @RequestParam String code) {
                AuthResponse res = authService.oauthLogin(provider, code);
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, getRefreshTokenCookie(res.getRefreshToken()).toString())
                                .body(Map.of(
                                                "token", res.getAccessToken()));
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletRequest request) {
                String accessToken = request.getHeader("Authorization").substring(7);
                authService.logout(accessToken);
                ResponseCookie cookie = ResponseCookie
                                .from(REFRESH_TOKEN_COOKIE_NAME, "")
                                .httpOnly(true)
                                .secure(true)
                                .path("/")
                                .maxAge(0)
                                .build();
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .build();
        }

        @GetMapping("/refresh")
        public ResponseEntity<Map<String, String>> refreshToken(
                        @CookieValue(value = REFRESH_TOKEN_COOKIE_NAME, defaultValue = "") String refreshToken) {
                AuthResponse res = authService.refresh(refreshToken);
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, getRefreshTokenCookie(res.getRefreshToken()).toString())
                                .body(Map.of(
                                                "token", res.getAccessToken()));
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordDTO dto,
                        HttpServletRequest request) {
                authService.passwordRecovery(dto.getLogin(), request);
                return ResponseEntity.ok(Map.of(
                                "status", "success"));
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordDTO dto) {
                authService.resetPassword(dto);
                return ResponseEntity.ok(Map.of(
                                "status", "success"));
        }

        private ResponseCookie getRefreshTokenCookie(String token) {
                return ResponseCookie
                                .from(REFRESH_TOKEN_COOKIE_NAME, token)
                                .httpOnly(true)
                                .secure(false)
                                .domain(constant.getDomain())
                                .path("/")
                                .sameSite("Lax")
                                .maxAge(constant.getRefreshTokenExpiration())
                                .build();
        }

}
