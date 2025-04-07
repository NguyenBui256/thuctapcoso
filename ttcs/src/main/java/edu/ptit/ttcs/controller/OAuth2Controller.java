package edu.ptit.ttcs.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/oauth2")
public class OAuth2Controller {

    @GetMapping("/success")
    public ResponseEntity<?> oauth2Success() {
        return ResponseEntity.ok().body("OAuth2 login successful");
    }

    @GetMapping("/failure")
    public ResponseEntity<?> oauth2Failure() {
        return ResponseEntity.badRequest().body("OAuth2 login failed");
    }
}