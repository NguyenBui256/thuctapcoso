package edu.ptit.ttcs.entity.oauth2;

import java.util.Map;

public class GithubOauth2UserInfo extends Oauth2UserInfo {

    public GithubOauth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getUsername() {
        return attributes.get("login").toString();
    }

    @Override
    public String getEmail() {
        return attributes.get("email").toString();
    }

    @Override
    public String getFullName() {
        return attributes.get("name").toString();
    }

    @Override
    public String getAvatarUrl() {
        return attributes.get("avatar_url").toString();
    }
}
