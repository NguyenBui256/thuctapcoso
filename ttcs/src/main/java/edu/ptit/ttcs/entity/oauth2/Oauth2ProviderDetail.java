package edu.ptit.ttcs.entity.oauth2;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class Oauth2ProviderDetail {

    private String tokenUri;

    private String userInfoUri;

}
