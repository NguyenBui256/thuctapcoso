package edu.ptit.ttcs.entity.dto.response;

import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.UserSettingsResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;

    private String refreshToken;

}
