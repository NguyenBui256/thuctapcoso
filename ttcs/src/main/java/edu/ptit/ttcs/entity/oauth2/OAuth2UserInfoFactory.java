package edu.ptit.ttcs.entity.oauth2;

import edu.ptit.ttcs.entity.enums.OauthProvider;

import java.util.Map;

public class OAuth2UserInfoFactory {

    public static Oauth2UserInfo getOAuth2UserInfo(OauthProvider provider, Map<String, Object> attributes) {
        return switch (provider) {
            case GOOGLE -> new GoogleOauth2UserInfo(attributes);
            case GITHUB -> new GithubOauth2UserInfo(attributes);
        };
    }

}