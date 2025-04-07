package edu.ptit.ttcs.config;

import edu.ptit.ttcs.dao.RoleRepository;
import edu.ptit.ttcs.entity.Role;
import edu.ptit.ttcs.entity.enums.RoleName;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DBInit implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        List<Role> roles = roleRepository.findAll();
        if(roles.isEmpty()){
            Role userRole = new Role();
            userRole.setDescription("Role for users and shops");
            userRole.setName(RoleName.USER.toString());

            Role adminRole = new Role();
            adminRole.setDescription("Role for big admins");
            adminRole.setName(RoleName.ADMIN.toString());

            roles.add(userRole);
            roles.add(adminRole);
            roleRepository.saveAll(roles);

            log.info("USER and ADMIN roles initiated");
        }
    }

}
