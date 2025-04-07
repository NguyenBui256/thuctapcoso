package edu.ptit.ttcs.service;

import edu.ptit.ttcs.common.Constant;
import edu.ptit.ttcs.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private final UserDetailsService userDetailsService;

    private final Constant constant;

    private final Random rand = new Random();

    public String extractUsername(String token) {
        try {
            log.info("Extracting username from token");
            Claims claims = Jwts
                    .parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            String username = claims.getSubject();
            log.info("Extracted username: {}", username);
            return username;
        } catch (Exception e) {
            log.error("Error extracting username from token: {}", e.getMessage());
            return null;
        }
    }

    public String extractId(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getId();
    }

    public Authentication getAuthentication(String token) {
        try {
            log.info("Getting authentication from token");
            String username = extractUsername(token);
            if (username == null) {
                log.error("Username is null");
                return null;
            }
            log.info("Loading user details for: {}", username);

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (userDetails == null) {
                log.error("UserDetails is null for username: {}", username);
                return null;
            }
            log.info("User details loaded successfully: {}", userDetails.getUsername());

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities());
            log.info("Authentication created successfully for user: {}", username);
            return authentication;
        } catch (Exception e) {
            log.error("Error creating authentication: {}", e.getMessage());
            return null;
        }
    }

    public String generateAccessToken(User user, Map<String, Object> claims) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(constant.getAccessTokenExpiration());
        claims.put("avatar", user.getAvatar());
        claims.put("fullName", user.getFullName());
        claims.put("email", user.getEmail());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .signWith(getSignKey())
                .compact();
    }

    public String generateRefreshToken(User user, Map<String, Object> claims) {
        Instant expiration = Instant.now().plusSeconds(constant.getRefreshTokenExpiration());
        String id = String.valueOf(rand.nextInt(100000000, 999999999));
        return Jwts.builder()
                .setClaims(claims)
                .setId(id)
                .setSubject(user.getUsername())
                .setExpiration(Date.from(expiration))
                .signWith(getSignKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            log.info("Validating token");
            Jws<Claims> claims = Jwts
                    .parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token);

            boolean isExpired = claims.getBody().getExpiration().before(new Date());
            if (isExpired) {
                log.warn("Token has expired");
                return false;
            }

            String username = claims.getBody().getSubject();
            if (username == null || username.isEmpty()) {
                log.warn("Token has no username");
                return false;
            }

            log.info("Token is valid for user: {}", username);
            return true;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(constant.getJwtSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

}