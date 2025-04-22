package edu.ptit.ttcs.entity.dto.request;

import edu.ptit.ttcs.validation.StrongPassword;
import edu.ptit.ttcs.validation.Username;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class RegistrationDTO {

    @Username
    private String username;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotNull(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @StrongPassword
    private String password;

    private String bio;

    private String avatar;

}
