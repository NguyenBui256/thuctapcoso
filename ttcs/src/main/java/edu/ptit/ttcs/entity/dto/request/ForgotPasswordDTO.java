
package edu.ptit.ttcs.entity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordDTO {

    // username hoặc email
    @NotBlank
    private String login;

}
