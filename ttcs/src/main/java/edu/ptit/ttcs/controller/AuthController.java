package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.common.Constant;
import edu.ptit.ttcs.dto.request.ForgotPasswordDTO;
import edu.ptit.ttcs.dto.request.LoginDTO;
import edu.ptit.ttcs.dto.request.RegistrationDTO;
import edu.ptit.ttcs.dto.request.ResetPasswordDTO;
import edu.ptit.ttcs.dto.response.AuthResponse;
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

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

        private final AuthService authService;

        private final Constant constant;

        private final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

        private final AuthenticationManagerBuilder authenticationManagerBuilder;

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody @Valid RegistrationDTO dto) {
                AuthResponse res = authService.register(dto, false);
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, getRefreshTokenCookie(res.getRefreshToken()).toString())
                                .body(Map.of(
                                                "token", res.getAccessToken()));
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
