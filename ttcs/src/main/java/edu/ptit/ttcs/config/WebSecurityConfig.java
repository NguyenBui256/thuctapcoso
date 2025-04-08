package edu.ptit.ttcs.config;

import edu.ptit.ttcs.service.Oauth2Service;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

@Configuration
public class WebSecurityConfig {

    /**
     * Create a mock ClientRegistrationRepository with a dummy registration
     * to satisfy Spring Security while OAuth2 is disabled in application.yml
     */
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        ClientRegistration dummyRegistration = ClientRegistration
                .withRegistrationId("google")
                .clientId("dummy-client-id")
                .clientSecret("dummy-client-secret")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:5173/oauth/redirect?provider=google")
                .scope("email", "profile")
                .authorizationUri("https://accounts.google.com/o/oauth2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .build();

        return new InMemoryClientRegistrationRepository(dummyRegistration);
    }

    /**
     * Create a mock OAuth2Service bean to prevent dependency injection errors
     * while OAuth2 is disabled in application.yml
     */
    @Bean
    public Oauth2Service oauth2Service(ClientRegistrationRepository clientRegistrationRepository) {
        return new MockOauth2Service(clientRegistrationRepository);
    }

    /**
     * Mock implementation of Oauth2Service that throws an exception when used
     */
    private static class MockOauth2Service extends Oauth2Service {
        public MockOauth2Service(ClientRegistrationRepository clientRegistrationRepository) {
            super(clientRegistrationRepository);
        }

        @Override
        public edu.ptit.ttcs.entity.oauth2.Oauth2UserInfo getUserInfo(
                edu.ptit.ttcs.entity.enums.OauthProvider provider, String code) {
            throw new UnsupportedOperationException("OAuth2 is disabled in configuration");
        }
    }
}