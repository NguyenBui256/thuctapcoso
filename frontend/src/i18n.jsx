import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    common: {
                        newProject: "NEW PROJECT",
                        myProjects: "MY PROJECTS",
                        publicProjects: "PUBLIC PROJECTS",
                        settings: "Settings",
                        profile: "Profile",
                        logout: "Logout",
                        search: "Search",
                        searchPlaceholder: "Search projects...",
                        noProjects: "No projects found",
                        createProject: "Create Project",
                        projectName: "Project Name",
                        description: "Description",
                        isPublic: "Public",
                        logoUrl: "Logo URL",
                        cancel: "Cancel",
                        save: "Save",
                        delete: "Delete",
                        edit: "Edit",
                        loading: "Loading...",
                        error: "Error",
                        success: "Success"
                    },
                    projectTypes: {
                        scrum: "Scrum",
                        kanban: "Kanban"
                    },
                    settings: {
                        accountSettings: "Account Settings",
                        profileSettings: "Profile Settings",
                        notificationSettings: "Notification Settings",
                        language: "Language",
                        theme: "Theme",
                        bio: "Bio",
                        photoUrl: "Photo URL",
                        currentPassword: "Current Password",
                        newPassword: "New Password",
                        confirmPassword: "Confirm Password",
                        changePassword: "Change Password",
                        saveChanges: "Save Changes",
                        updateProfile: "Profile updated successfully",
                        updatePassword: "Password updated successfully",
                        passwordMismatch: "New passwords do not match"
                    },
                    notifications: {
                        emailNotifications: "Email Notifications",
                        pushNotifications: "Push Notifications",
                        taskUpdates: "Task Updates",
                        projectUpdates: "Project Updates",
                        mentionNotifications: "Mention Notifications",
                        commentNotifications: "Comment Notifications",
                        saveSettings: "Save Settings"
                    }
                }
            },
            vi: {
                translation: {
                    common: {
                        newProject: "DỰ ÁN MỚI",
                        myProjects: "DỰ ÁN CỦA TÔI",
                        publicProjects: "DỰ ÁN CÔNG KHAI",
                        settings: "Cài đặt",
                        profile: "Hồ sơ",
                        logout: "Đăng xuất",
                        search: "Tìm kiếm",
                        searchPlaceholder: "Tìm kiếm dự án...",
                        noProjects: "Không tìm thấy dự án",
                        createProject: "Tạo Dự Án",
                        projectName: "Tên Dự Án",
                        description: "Mô tả",
                        isPublic: "Công khai",
                        logoUrl: "URL Logo",
                        cancel: "Hủy",
                        save: "Lưu",
                        delete: "Xóa",
                        edit: "Chỉnh sửa",
                        loading: "Đang tải...",
                        error: "Lỗi",
                        success: "Thành công"
                    },
                    projectTypes: {
                        scrum: "Scrum",
                        kanban: "Kanban"
                    },
                    settings: {
                        accountSettings: "Cài Đặt Tài Khoản",
                        profileSettings: "Cài Đặt Hồ Sơ",
                        notificationSettings: "Cài Đặt Thông Báo",
                        language: "Ngôn ngữ",
                        theme: "Giao diện",
                        bio: "Giới thiệu",
                        photoUrl: "URL Ảnh",
                        currentPassword: "Mật khẩu hiện tại",
                        newPassword: "Mật khẩu mới",
                        confirmPassword: "Xác nhận mật khẩu",
                        changePassword: "Đổi mật khẩu",
                        saveChanges: "Lưu thay đổi",
                        updateProfile: "Cập nhật hồ sơ thành công",
                        updatePassword: "Cập nhật mật khẩu thành công",
                        passwordMismatch: "Mật khẩu mới không khớp"
                    },
                    notifications: {
                        emailNotifications: "Thông báo qua email",
                        pushNotifications: "Thông báo đẩy",
                        taskUpdates: "Cập nhật công việc",
                        projectUpdates: "Cập nhật dự án",
                        mentionNotifications: "Thông báo khi được nhắc",
                        commentNotifications: "Thông báo bình luận",
                        saveSettings: "Lưu cài đặt"
                    }
                }
            }
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n; 