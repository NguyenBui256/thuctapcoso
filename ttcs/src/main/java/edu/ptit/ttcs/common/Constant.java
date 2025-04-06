package edu.ptit.ttcs.common;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class Constant {

    @Value("${jwt.secret_key}")
    private String jwtSecret;

    @Value("${jwt.expiration.access_token}")
    private int accessTokenExpiration;

    @Value("${jwt.expiration.refresh_token}")
    private int refreshTokenExpiration;

    @Value("${server.servlet.session.cookie.domain}")
    private String domain;

    @Value("${fe_base_url}")
    private String feBaseUrl;

}
