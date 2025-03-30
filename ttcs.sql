use ttcs;
create table module
(
    id          int                          not null
        primary key,
    name        varchar(100) charset utf8mb3 null,
    description longtext                     null
);

create table permissions
(
    id         bigint auto_increment
        primary key,
    api_path   varchar(255) not null,
    created_at datetime(6)  null,
    created_by varchar(255) null,
    method     varchar(255) not null,
    module     varchar(255) not null,
    name       varchar(255) not null,
    updated_at datetime(6)  null,
    updated_by varchar(255) null
);

create table roles
(
    id          bigint auto_increment
        primary key,
    active      bit          not null,
    description varchar(255) null,
    name        varchar(255) not null
);

create table sprint
(
    id         int      not null
        primary key,
    name       text     not null,
    start_date datetime null,
    end_date   datetime null
);

create table user
(
    id       int          not null
        primary key,
    username varchar(255) not null,
    email    varchar(255) not null,
    fullname text         not null,
    bio      text         null,
    avatar   text         null,
    password text         not null,
    role_id  bigint       null,
    constraint email
        unique (email),
    constraint username
        unique (username),
    constraint fk_user_roles
        foreign key (role_id) references roles (id)
);

create table attachment
(
    id         int          not null
        primary key,
    type       varchar(255) null,
    url        text         null,
    is_delete  tinyint(1)   null,
    created_by int          null,
    created_at timestamp    null,
    constraint attachment_ibfk_1
        foreign key (created_by) references user (id)
);

create index created_by
    on attachment (created_by);

create table issue_attachment
(
    issue_id      int null,
    attachment_id int null,
    constraint issue_attachment_ibfk_1
        foreign key (attachment_id) references attachment (id)
);

create index attachment_id
    on issue_attachment (attachment_id);

create table notification
(
    id          int                         not null
        primary key,
    receiver_id int                         null,
    description text                        not null,
    object_id   int                         null,
    type        varchar(20) charset utf8mb3 null,
    created_at  datetime                    null,
    constraint notification_ibfk_1
        foreign key (receiver_id) references user (id)
);

create index receiver_id
    on notification (receiver_id);

create table project
(
    id          int                          not null
        primary key,
    name        varchar(100) charset utf8mb3 null,
    description longtext                     null,
    owner_id    int                          null,
    is_public   tinyint(1)                   null,
    logo_url    longtext                     null,
    is_deleted  tinyint(1)                   null,
    constraint project_ibfk_1
        foreign key (owner_id) references user (id)
);

create table activity
(
    id           int                         not null
        primary key,
    project_id   int                         null,
    user_id      int                         null,
    activity_des text                        not null,
    object_id    int                         null,
    type         varchar(20) charset utf8mb3 null,
    created_at   datetime                    null,
    constraint activity_ibfk_1
        foreign key (project_id) references project (id),
    constraint activity_ibfk_2
        foreign key (user_id) references user (id)
);

create index project_id
    on activity (project_id);

create index user_id
    on activity (user_id);

create table kanban_swimlane
(
    id         int                          not null
        primary key,
    project_id int                          null,
    prior_order    int                          null,
    name       varchar(100) charset utf8mb3 null,
    constraint kanban_swimlane_ibfk_1
        foreign key (project_id) references project (id)
);

create index project_id
    on kanban_swimlane (project_id);

create table pjsetting_point
(
    id         int                          not null
        primary key,
    project_id int                          null,
    prior_order    int                          null,
    name       varchar(100) charset utf8mb3 null,
    point      float                        null,
    constraint pjsetting_point_ibfk_1
        foreign key (project_id) references project (id)
);

create index project_id
    on pjsetting_point (project_id);

create table pjsetting_priority
(
    id         int                          not null
        primary key,
    project_id int                          null,
    prior_order    int                          null,
    color      varchar(7) charset utf8mb3   null,
    name       varchar(100) charset utf8mb3 null,
    constraint pjsetting_priority_ibfk_1
        foreign key (project_id) references project (id)
);

create index project_id
    on pjsetting_priority (project_id);

create table pjsetting_severity
(
    id         int                          not null
        primary key,
    project_id int                          null,
    prior_order    int                          null,
    color      varchar(7) charset utf8mb3   null,
    name       varchar(100) charset utf8mb3 null,
    constraint pjsetting_severity_ibfk_1
        foreign key (project_id) references project (id)
);

create index project_id
    on pjsetting_severity (project_id);

create table pjsetting_status
(
    id         int                          not null
        primary key,
    project_id int                          null,
    prior_order    int                          null,
    type       varchar(20) charset utf8mb3  null,
    color      varchar(7) charset utf8mb3   null,
    name       varchar(50) charset utf8mb3  null,
    slug       varchar(100) charset utf8mb3 null,
    closed     tinyint(1)                   null,
    archived   tinyint(1)                   null,
    constraint pjsetting_status_ibfk_1
        foreign key (project_id) references project (id)
);

create index project_id
    on pjsetting_status (project_id);

create table pjsetting_tag
(
    id         int                          not null
        primary key,
    project_id int                          null,
    prior_order    int                          null,
    color      varchar(7) charset utf8mb3   null,
    name       varchar(100) charset utf8mb3 null,
    constraint pjsetting_tag_ibfk_1
        foreign key (project_id) references project (id)
);

create index project_id
    on pjsetting_tag (project_id);

create table pjsetting_type
(
    id         int                          not null
        primary key,
    project_id int                          null,
    prior_order    int                          null,
    color      varchar(7) charset utf8mb3   null,
    name       varchar(100) charset utf8mb3 null,
    constraint pjsetting_type_ibfk_1
        foreign key (project_id) references project (id)
);

create table issue
(
    issue_id    int  not null
        primary key,
    id          int  null,
    name        text not null,
    description text null,
    due_date    date null,
    status_id   int  null,
    type_id     int  null,
    severity_id int  null,
    priority_id int  null,
    constraint issue_ibfk_1
        foreign key (id) references sprint (id),
    constraint issue_ibfk_2
        foreign key (status_id) references pjsetting_status (id),
    constraint issue_ibfk_3
        foreign key (type_id) references pjsetting_type (id),
    constraint issue_ibfk_4
        foreign key (severity_id) references pjsetting_severity (id),
    constraint issue_ibfk_5
        foreign key (priority_id) references pjsetting_priority (id)
);

create index id
    on issue (id);

create index priority_id
    on issue (priority_id);

create index severity_id
    on issue (severity_id);

create index status_id
    on issue (status_id);

create index type_id
    on issue (type_id);

create table issue_tag
(
    issue_id int not null,
    tag_id   int not null,
    primary key (issue_id, tag_id),
    constraint issue_tag_ibfk_1
        foreign key (issue_id) references issue (issue_id),
    constraint issue_tag_ibfk_2
        foreign key (tag_id) references pjsetting_tag (id)
);

create index tag_id
    on issue_tag (tag_id);

create table issue_user
(
    issue_id int not null,
    id       int not null,
    primary key (issue_id, id),
    constraint issue_user_ibfk_1
        foreign key (issue_id) references issue (issue_id),
    constraint issue_user_ibfk_2
        foreign key (id) references user (id)
);

create index id
    on issue_user (id);

create table issue_watcher
(
    issue_id int not null,
    id       int not null,
    primary key (issue_id, id),
    constraint issue_watcher_ibfk_1
        foreign key (issue_id) references issue (issue_id),
    constraint issue_watcher_ibfk_2
        foreign key (id) references user (id)
);

create index id
    on issue_watcher (id);

create index project_id
    on pjsetting_type (project_id);

create index owner_id
    on project (owner_id);

create table project_module
(
    project_id int null,
    module_id  int null,
    constraint project_module_ibfk_1
        foreign key (project_id) references project (id),
    constraint project_module_ibfk_2
        foreign key (module_id) references module (id)
);

create index module_id
    on project_module (module_id);

create index project_id
    on project_module (project_id);

create table project_role
(
    id         int          not null
        primary key,
    project_id int          null,
    role_name  varchar(255) null,
    created_at timestamp    null,
    updated_at timestamp    null,
    constraint project_role_ibfk_1
        foreign key (project_id) references project (id)
);

create table permission_role
(
    role_id       int    not null,
    permission_id bigint not null,
    constraint FK3vhflqw0lwbwn49xqoivrtugt
        foreign key (role_id) references project_role (id),
    constraint FK6mg4g9rc8u87l0yavf8kjut05
        foreign key (permission_id) references permissions (id)
);

create table project_member
(
    project_id      int        null,
    user_id         int        null,
    project_role_id int        null,
    total_point     int        null,
    is_admin        tinyint(1) null,
    is_delete       tinyint(1) null,
    created_at      timestamp  null,
    updated_at      timestamp  null,
    constraint project_member_ibfk_1
        foreign key (project_id) references project (id),
    constraint project_member_ibfk_2
        foreign key (user_id) references user (id),
    constraint project_member_ibfk_3
        foreign key (project_role_id) references project_role (id)
);

create index project_id
    on project_member (project_id);

create index project_role_id
    on project_member (project_role_id);

create index user_id
    on project_member (user_id);

create index project_id
    on project_role (project_id);

create table project_wiki_page
(
    id         int          not null
        primary key,
    project_id int          null,
    title      varchar(255) null,
    content    text         null,
    is_delete  tinyint(1)   null,
    created_by int          null,
    created_at timestamp    null,
    updated_by int          null,
    updated_at timestamp    null,
    edit_count int          null,
    constraint project_wiki_page_ibfk_1
        foreign key (project_id) references project (id),
    constraint project_wiki_page_ibfk_2
        foreign key (created_by) references user (id),
    constraint project_wiki_page_ibfk_3
        foreign key (updated_by) references user (id)
);

create index created_by
    on project_wiki_page (created_by);

create index project_id
    on project_wiki_page (project_id);

create index updated_by
    on project_wiki_page (updated_by);

CREATE TABLE sprint_issue (
    id        INT NOT NULL PRIMARY KEY,
    sprint_id INT NULL,
    issue_id  INT NULL,
    CONSTRAINT sprint_issue_ibfk_1
        FOREIGN KEY (sprint_id) REFERENCES sprint (id),
    CONSTRAINT sprint_issue_ibfk_2
        FOREIGN KEY (issue_id) REFERENCES issue (issue_id)
);

create index issue_id
    on sprint_issue (issue_id);

create index sprint_id
    on sprint_issue (sprint_id);

create table task_attachment
(
    id            int null,
    attachment_id int null,
    constraint task_attachment_ibfk_1
        foreign key (attachment_id) references attachment (id)
);

create index attachment_id
    on task_attachment (attachment_id);

create table user_setting
(
    id                int                  not null
        primary key,
    user_id           int                  null,
    email_noti_enable tinyint(1) default 1 null,
    constraint user_setting_ibfk_1
        foreign key (user_id) references user (id)
);

create index user_id
    on user_setting (user_id);

create table user_story
(
    id            int                  not null
        primary key,
    sprint_id     int                  null,
    name          text                 not null,
    description   text                 null,
    due_date      date                 null,
    status_id     int                  null,
    is_block      tinyint(1) default 0 null,
    ux_points     int        default 0 null,
    back_points   int        default 0 null,
    front_points  int        default 0 null,
    design_points int        default 0 null,
    constraint user_story_ibfk_1
        foreign key (sprint_id) references sprint (id),
    constraint user_story_ibfk_2
        foreign key (status_id) references pjsetting_status (id)
)
    comment 'status values: ''To Do'', ''In Progress'', ''Done''';

create table task
(
    id            int  not null
        primary key,
    user_id       int  null,
    user_story_id int  null,
    name          text not null,
    description   text null,
    due_date      date null,
    status_id     int  null,
    constraint task_ibfk_1
        foreign key (user_id) references user (id),
    constraint task_ibfk_2
        foreign key (user_story_id) references user_story (id),
    constraint task_ibfk_3
        foreign key (status_id) references pjsetting_status (id)
)
    comment 'status values: ''To Do'', ''In Progress'', ''Done''';

create table comment
(
    id         int      not null
        primary key,
    user_id    int      null,
    task_id    int      null,
    issue_id   int      null,
    content    text     not null,
    created_at datetime null,
    constraint comment_ibfk_1
        foreign key (user_id) references user (id),
    constraint comment_ibfk_2
        foreign key (task_id) references task (id),
    constraint comment_ibfk_3
        foreign key (issue_id) references issue (issue_id)
);

create index issue_id
    on comment (issue_id);

create index task_id
    on comment (task_id);

create index user_id
    on comment (user_id);

create index status_id
    on task (status_id);

create index user_id
    on task (user_id);

create index user_story_id
    on task (user_story_id);

create table task_tag
(
    id     int not null,
    tag_id int not null,
    primary key (id, tag_id),
    constraint task_tag_ibfk_1
        foreign key (id) references task (id),
    constraint task_tag_ibfk_2
        foreign key (tag_id) references pjsetting_tag (id)
);

create index tag_id
    on task_tag (tag_id);

create table task_watcher
(
    task_id int not null,
    user_id int not null,
    primary key (task_id, user_id),
    constraint task_watcher_ibfk_1
        foreign key (task_id) references task (id),
    constraint task_watcher_ibfk_2
        foreign key (user_id) references user (id)
);

create index user_id
    on task_watcher (user_id);

create index sprint_id
    on user_story (sprint_id);

create index status_id
    on user_story (status_id);

create table user_story_tag
(
    id     int not null,
    tag_id int not null,
    primary key (id, tag_id),
    constraint user_story_tag_ibfk_1
        foreign key (id) references user_story (id),
    constraint user_story_tag_ibfk_2
        foreign key (tag_id) references pjsetting_tag (id)
);

create index tag_id
    on user_story_tag (tag_id);

create table user_story_user
(
    user_story_id int not null,
    user_id       int not null,
    primary key (user_story_id, user_id),
    constraint user_story_user_ibfk_1
        foreign key (user_story_id) references user_story (id),
    constraint user_story_user_ibfk_2
        foreign key (user_id) references user (id)
);

create index user_id
    on user_story_user (user_id);

create table user_story_watcher
(
    user_story_id int not null,
    user_id       int not null,
    primary key (user_story_id, user_id),
    constraint user_story_watcher_ibfk_1
        foreign key (user_story_id) references user_story (id),
    constraint user_story_watcher_ibfk_2
        foreign key (user_id) references user (id)
);

create index user_id
    on user_story_watcher (user_id);

create table wiki_page_attachment
(
    wiki_page_id  int null,
    attachment_id int null,
    constraint wiki_page_attachment_ibfk_1
        foreign key (wiki_page_id) references project_wiki_page (id),
    constraint wiki_page_attachment_ibfk_2
        foreign key (attachment_id) references attachment (id)
);

create index attachment_id
    on wiki_page_attachment (attachment_id);

create index wiki_page_id
    on wiki_page_attachment (wiki_page_id);


