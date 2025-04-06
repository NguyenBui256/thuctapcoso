package edu.ptit.ttcs.service.facade;

import edu.ptit.ttcs.common.Constant;
import edu.ptit.ttcs.dao.ForgotPasswordTokenDAO;
import edu.ptit.ttcs.dto.request.ResetPasswordDTO;
import edu.ptit.ttcs.entity.ForgotPasswordToken;
import edu.ptit.ttcs.entity.oauth2.Oauth2UserInfo;
import edu.ptit.ttcs.dto.request.LoginDTO;
import edu.ptit.ttcs.dto.request.RegistrationDTO;
import edu.ptit.ttcs.dto.response.AuthResponse;
import edu.ptit.ttcs.entity.Role;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.enums.OauthProvider;
import edu.ptit.ttcs.entity.enums.RoleName;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.service.JwtService;
import edu.ptit.ttcs.service.MailService;
import edu.ptit.ttcs.service.Oauth2Service;
import edu.ptit.ttcs.service.UserService;
import edu.ptit.ttcs.service.redis.JwtRedisService;
import edu.ptit.ttcs.util.ModelMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;

    private final Oauth2Service oauth2Service;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final JwtRedisService jwtRedisService;

    private final MailService mailService;

    private final ForgotPasswordTokenDAO forgotPasswordTokenDAO;

    private final Constant constant;

    public AuthResponse register(RegistrationDTO dto, boolean oauth){
        if(!oauth){
            User existedUser = userService.getUserByLogin(dto.getUsername(), dto.getEmail());
            if(existedUser != null){
                if(existedUser.getUsername().equals(dto.getUsername())){
                    throw new RequestException("Username đã tồn tại");
                }
                else throw new RequestException("Email đã tồn tại");
            }
        }
        else{
            List<User> prefUsers = userService.getAllUsersHasUsernameStartWith(dto.getUsername());
            boolean existedUsername = true;
            int count = -1;
            while(existedUsername){
                count++;
                existedUsername = false;
                String tmp = dto.getUsername()  + (count > 0 ? "-" + count : "");
                for(User user : prefUsers){
                    if (user.getUsername().equals(tmp)) {
                        existedUsername = true;
                        break;
                    }
                }
            }
            dto.setUsername(dto.getUsername() + (count > 0 ? "-" + count : ""));
        }
        dto.setEmail(dto.getEmail().toLowerCase());
        Role userRole = userService.getRoleByName(RoleName.USER);
        User user = ModelMapper.getInstance().map(dto, User.class);
        user.setRole(userRole);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        if(dto.getAvatar() != null) user.setAvatar(dto.getAvatar());
        else user.setAvatar(userService.getRandomUserDefaultAvatar());
        user = userService.saveUser(user);
        String refreshToken = jwtService.generateRefreshToken(user, new HashMap<>());
        jwtRedisService.setNewRefreshToken(user.getUsername(), refreshToken);
        return new AuthResponse(
                jwtService.generateAccessToken(user, new HashMap<>()),
                refreshToken
        );
    }

    public AuthResponse login(LoginDTO dto){
        User user = userService.getUserByLogin(dto.getLogin());
        if(user == null){
            throw new RequestException("Thông tin đăng nhập không tồn tại");
        }
        if(!passwordEncoder.matches(dto.getPassword(), user.getPassword())){
            throw new RequestException("Mật khẩu không chính xác");
        }
        String refreshToken = jwtService.generateRefreshToken(user, new HashMap<>());
        jwtRedisService.setNewRefreshToken(user.getUsername(), refreshToken);
        return new AuthResponse(
                jwtService.generateAccessToken(user, new HashMap<>()),
                refreshToken
        );
    }


    public AuthResponse oauthLogin(String provider, String code) {
        OauthProvider prov = OauthProvider.fromString(provider);
        Oauth2UserInfo userInfo = oauth2Service.getUserInfo(prov, code);
        boolean existed = userService.existByEmail(userInfo.getEmail());
        if(existed){
            return login(LoginDTO.builder()
                    .login(userInfo.getEmail())
                    .password("")
                    .build());
        }
        else{
            return register(RegistrationDTO.builder()
                    .username(userInfo.getUsername())
                    .email(userInfo.getEmail())
                    .fullName(userInfo.getFullName())
                    .password("")
                    .avatar(userInfo.getAvatarUrl())
                    .build(), true);
        }
    }

    public void logout(String accessToken) {
        String username = jwtService.extractUsername(accessToken);
        jwtRedisService.deleteRefreshToken(username);
    }

    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()
                || !jwtService.isTokenValid(refreshToken)
                || !jwtRedisService.isRefreshTokenValid(jwtService.extractUsername(refreshToken), refreshToken)
        )
            throw new RequestException("Refresh token không hợp lệ/quá hạn");
        String username = jwtService.extractUsername(refreshToken);
        User user = userService.getUserByLogin(username);
        String accessToken = jwtService.generateAccessToken(
                user,
                new HashMap<>());
        String newRefreshToken = jwtService.generateRefreshToken(
                user,
                new HashMap<>()
        );
        jwtRedisService.setNewRefreshToken(username, newRefreshToken);
        return new AuthResponse(accessToken, newRefreshToken);
    }

    public void passwordRecovery(@NotBlank String login,
                                 HttpServletRequest request) {
        User user = userService.getUserByLogin(login);
        if(user == null){
            throw new RequestException("Username/Email không tồn tại");
        }
        String email = user.getEmail();
        LocalDateTime tenMinutesLater = LocalDateTime.now().plusMinutes(10);
        Date expire = Date.from(tenMinutesLater.atZone(ZoneId.systemDefault()).toInstant());
        ForgotPasswordToken token = ForgotPasswordToken.builder()
                .user(user)
                .expiredAt(expire)
                .build();
        forgotPasswordTokenDAO.save(token);
        String recoveryUrl = constant.getFeBaseUrl() + "/reset-password/" + token.getToken();
        mailService.sendEmail(email, "[Tagai] Yêu cầu đặt lại mật khẩu",
                String.format("""
                        Hãy truy cập vào link sau để đặt lại mật khẩu: \
                        
                        %s \
                        
                        Link sẽ hết hạn trong 10 phút""", recoveryUrl));
    }

    public void resetPassword(ResetPasswordDTO dto) {
        ForgotPasswordToken token = forgotPasswordTokenDAO.findByToken(dto.getToken());
        if(token == null)
            throw new RequestException("Yêu cầu không hợp lệ");
        if(token.getExpiredAt().before(new Date()))
            throw new RequestException("Yêu cầu đã hết hạn, vui lòng tạo yêu cầu mới");
        User user = token.getUser();
        String hashPwd = passwordEncoder.encode(dto.getNewPassword());
        user.setPassword(hashPwd);
        userService.saveUser(user);
        forgotPasswordTokenDAO.delete(token);
    }
}
