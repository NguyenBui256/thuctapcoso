package edu.ptit.ttcs.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.ptit.ttcs.dao.RoleRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.PermissionRepository;
import edu.ptit.ttcs.dao.ModuleRepository;
import edu.ptit.ttcs.entity.Role;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.Permission;
import edu.ptit.ttcs.entity.Module;

@Service
public class DatabaseInitializer implements CommandLineRunner {
        private final RoleRepository roleRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final PermissionRepository permissionRepository;
        private final ModuleRepository moduleRepository;

        public DatabaseInitializer(
                        RoleRepository roleRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        PermissionRepository permissionRepository,
                        ModuleRepository moduleRepository) {
                this.roleRepository = roleRepository;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.permissionRepository = permissionRepository;
                this.moduleRepository = moduleRepository;
        }

        @Override
        public void run(String... args) throws Exception {
                System.out.println(">>> START INIT DATABASE");
                long countRoles = this.roleRepository.count();
                long countUsers = this.userRepository.count();
                long countPermissions = this.permissionRepository.count();
                long countModules = this.moduleRepository.count();

                if (countRoles == 0) {
                        // Tạo role SUPER_ADMIN với toàn bộ quyền
                        Role adminRole = new Role();
                        adminRole.setName("ADMIN");
                        adminRole.setDescription("Admin có toàn quyền");
                        adminRole.setActive(true);
                        this.roleRepository.save(adminRole);

                        // Tạo role USER và gán quyền đã lọc
                        Role userRole = new Role();
                        userRole.setName("USER");
                        userRole.setDescription("Người dùng thông thường");
                        userRole.setActive(true);
                        this.roleRepository.save(userRole);
                }

                if (countUsers == 0) {
                        User adminUser = new User();
                        adminUser.setUsername("admin");
                        adminUser.setEmail("admin@gmail.com");
                        adminUser.setFullName("I'm super admin");
                        adminUser.setPassword(this.passwordEncoder.encode("123456"));
                        Role adminRole = this.roleRepository.findByName("ADMIN").orElse(null);
                        adminUser.setRole(adminRole);

                        // Set required timestamp fields
                        LocalDateTime now = LocalDateTime.now();
                        adminUser.setCreatedAt(now);
                        adminUser.setUpdatedAt(now);

                        this.userRepository.save(adminUser);
                }

                if (countPermissions == 0) {
                        // Epics permissions
                        List<Permission> permissions = new ArrayList<>();

                        // Epics permissions
                        permissions.add(createPermission("/api/v1/projects/{projectId}/epics", "GET", "Epics",
                                        "View epics"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/epics", "POST", "Epics",
                                        "Add epics"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/epics/{epicId}", "PUT", "Epics",
                                        "Modify epics"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/epics/{epicId}/comments", "POST",
                                        "Epics", "Comment epics"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/epics/{epicId}", "DELETE",
                                        "Epics", "Delete epics"));

                        // Sprints permissions
                        permissions.add(createPermission("/api/v1/projects/{projectId}/sprints", "GET", "Sprints",
                                        "View sprints"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/sprints", "POST", "Sprints",
                                        "Add sprints"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/sprints/{sprintId}", "PUT",
                                        "Sprints", "Modify sprints"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/sprints/{sprintId}", "DELETE",
                                        "Sprints", "Delete sprints"));

                        // User Stories permissions
                        permissions.add(createPermission("/api/v1/projects/{projectId}/user-stories", "GET",
                                        "User Stories", "View user stories"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/user-stories", "POST",
                                        "User Stories", "Add user stories"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/user-stories/{storyId}", "PUT",
                                        "User Stories", "Modify user stories"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/user-stories/{storyId}/comments",
                                        "POST", "User Stories", "Comment user stories"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/user-stories/{storyId}",
                                        "DELETE", "User Stories", "Delete user stories"));

                        // Tasks permissions
                        permissions.add(createPermission("/api/v1/projects/{projectId}/tasks", "GET", "Tasks",
                                        "View tasks"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/tasks", "POST", "Tasks",
                                        "Add tasks"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/tasks/{taskId}", "PUT", "Tasks",
                                        "Modify tasks"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/tasks/{taskId}/comments", "POST",
                                        "Tasks", "Comment tasks"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/tasks/{taskId}", "DELETE",
                                        "Tasks", "Delete tasks"));

                        // Issues permissions
                        permissions.add(createPermission("/api/v1/projects/{projectId}/issues", "GET", "Issues",
                                        "View issues"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/issues", "POST", "Issues",
                                        "Add issues"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/issues/{issueId}", "PUT",
                                        "Issues", "Modify issues"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/issues/{issueId}/comments",
                                        "POST", "Issues", "Comment issues"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/issues/{issueId}", "DELETE",
                                        "Issues", "Delete issues"));

                        // Wiki permissions
                        permissions.add(createPermission("/api/v1/projects/{projectId}/wiki", "GET", "Wiki",
                                        "View wiki pages"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/wiki", "POST", "Wiki",
                                        "Add wiki pages"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/wiki/{pageId}", "PUT", "Wiki",
                                        "Modify wiki pages"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/wiki/{pageId}", "DELETE", "Wiki",
                                        "Delete wiki pages"));
                        permissions.add(createPermission("/api/v1/projects/{projectId}/wiki/{pageId}/links", "POST",
                                        "Wiki", "Add wiki links"));

                        permissionRepository.saveAll(permissions);
                }

                if (countModules == 0) {
                        List<Module> modules = new ArrayList<>();

                        Module scrumModule = new Module();
                        scrumModule.setId(1L);
                        scrumModule.setName("Scrum");
                        scrumModule.setDescription(
                                        "Quản lý dự án theo phương pháp Scrum với các tính năng như Sprint, User Stories, và Task Management.");
                        modules.add(scrumModule);

                        Module kanbanModule = new Module();
                        kanbanModule.setId(2L);
                        kanbanModule.setName("Kanban");
                        kanbanModule.setDescription(
                                        "Quản lý công việc theo phương pháp Kanban với bảng trực quan, theo dõi tiến độ và quản lý luồng công việc.");
                        modules.add(kanbanModule);

                        Module issuesModule = new Module();
                        issuesModule.setId(3L);
                        issuesModule.setName("Issues");
                        issuesModule.setDescription("Theo dõi vấn đề, báo cáo lỗi và quản lý yêu cầu trong dự án.");
                        modules.add(issuesModule);

                        Module wikiModule = new Module();
                        wikiModule.setId(4L);
                        wikiModule.setName("Wiki");
                        wikiModule.setDescription("Tài liệu dự án và cơ sở kiến thức cho đội nhóm.");
                        modules.add(wikiModule);

                        moduleRepository.saveAll(modules);
                }

                if (countRoles > 0 && countUsers > 0 && countPermissions > 0 && countModules > 0) {
                        System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA...");
                } else {
                        System.out.println(">>> END INIT DATABASE");
                }
        }

        private Permission createPermission(String apiPath, String method, String module, String name) {
                Permission permission = new Permission();
                permission.setApiPath(apiPath);
                permission.setMethod(method);
                permission.setModule(module);
                permission.setName(name);
                LocalDateTime now = LocalDateTime.now();
                permission.setCreatedAt(now);
                permission.setUpdatedAt(now);
                return permission;
        }
}
