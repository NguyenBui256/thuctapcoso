package edu.ptit.ttcs.config;

import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.exception.RequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MyUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    // username or email
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(login)
                .orElseThrow(() -> new RequestException("Thông tin đăng nhập không tồn tại"));
        return new MyUserDetail(user);
    }
}
