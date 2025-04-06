package edu.ptit.ttcs.entity.oauth2;

import edu.ptit.ttcs.entity.enums.OauthProvider;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class Oauth2ClientInfo {

    private String clientId;

    private String clientSecret;

    private String redirectUri;

    private String scope;

}
