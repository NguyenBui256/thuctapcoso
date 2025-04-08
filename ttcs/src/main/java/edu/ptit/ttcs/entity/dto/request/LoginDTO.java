package edu.ptit.ttcs.entity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginDTO {

    @NotBlank(message = "Username hoặc email không được để trống")
    // email or username
    private String login;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

}
