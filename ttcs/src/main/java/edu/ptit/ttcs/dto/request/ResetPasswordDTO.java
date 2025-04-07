package edu.ptit.ttcs.dto.request;

import edu.ptit.ttcs.validation.StrongPassword;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordDTO {

    private String token;

    @StrongPassword
    private String newPassword;

}
