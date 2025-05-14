-- Epics permissions
INSERT INTO permissions (api_path, method, module, name, created_at, updated_at) VALUES 
('/api/v1/projects/{projectId}/epics', 'GET', 'Epics', 'View epics', NOW(), NOW()),
('/api/v1/projects/{projectId}/epics', 'POST', 'Epics', 'Add epics', NOW(), NOW()),
('/api/v1/projects/{projectId}/epics/{epicId}', 'PUT', 'Epics', 'Modify epics', NOW(), NOW()),
('/api/v1/projects/{projectId}/epics/{epicId}/comments', 'POST', 'Epics', 'Comment epics', NOW(), NOW()),
('/api/v1/projects/{projectId}/epics/{epicId}', 'DELETE', 'Epics', 'Delete epics', NOW(), NOW());

-- Sprints permissions
INSERT INTO permissions (api_path, method, module, name, created_at, updated_at) VALUES 
('/api/v1/projects/{projectId}/sprints', 'GET', 'Sprints', 'View sprints', NOW(), NOW()),
('/api/v1/projects/{projectId}/sprints', 'POST', 'Sprints', 'Add sprints', NOW(), NOW()),
('/api/v1/projects/{projectId}/sprints/{sprintId}', 'PUT', 'Sprints', 'Modify sprints', NOW(), NOW()),
('/api/v1/projects/{projectId}/sprints/{sprintId}', 'DELETE', 'Sprints', 'Delete sprints', NOW(), NOW());

-- User Stories permissions
INSERT INTO permissions (api_path, method, module, name, created_at, updated_at) VALUES 
('/api/v1/projects/{projectId}/user-stories', 'GET', 'User Stories', 'View user stories', NOW(), NOW()),
('/api/v1/projects/{projectId}/user-stories', 'POST', 'User Stories', 'Add user stories', NOW(), NOW()),
('/api/v1/projects/{projectId}/user-stories/{storyId}', 'PUT', 'User Stories', 'Modify user stories', NOW(), NOW()),
('/api/v1/projects/{projectId}/user-stories/{storyId}/comments', 'POST', 'User Stories', 'Comment user stories', NOW(), NOW()),
('/api/v1/projects/{projectId}/user-stories/{storyId}', 'DELETE', 'User Stories', 'Delete user stories', NOW(), NOW());

-- Tasks permissions
INSERT INTO permissions (api_path, method, module, name, created_at, updated_at) VALUES 
('/api/v1/projects/{projectId}/tasks', 'GET', 'Tasks', 'View tasks', NOW(), NOW()),
('/api/v1/projects/{projectId}/tasks', 'POST', 'Tasks', 'Add tasks', NOW(), NOW()),
('/api/v1/projects/{projectId}/tasks/{taskId}', 'PUT', 'Tasks', 'Modify tasks', NOW(), NOW()),
('/api/v1/projects/{projectId}/tasks/{taskId}/comments', 'POST', 'Tasks', 'Comment tasks', NOW(), NOW()),
('/api/v1/projects/{projectId}/tasks/{taskId}', 'DELETE', 'Tasks', 'Delete tasks', NOW(), NOW());

-- Issues permissions
INSERT INTO permissions (api_path, method, module, name, created_at, updated_at) VALUES 
('/api/v1/projects/{projectId}/issues', 'GET', 'Issues', 'View issues', NOW(), NOW()),
('/api/v1/projects/{projectId}/issues', 'POST', 'Issues', 'Add issues', NOW(), NOW()),
('/api/v1/projects/{projectId}/issues/{issueId}', 'PUT', 'Issues', 'Modify issues', NOW(), NOW()),
('/api/v1/projects/{projectId}/issues/{issueId}/comments', 'POST', 'Issues', 'Comment issues', NOW(), NOW()),
('/api/v1/projects/{projectId}/issues/{issueId}', 'DELETE', 'Issues', 'Delete issues', NOW(), NOW());

-- Wiki permissions
INSERT INTO permissions (api_path, method, module, name, created_at, updated_at) VALUES 
('/api/v1/projects/{projectId}/wiki', 'GET', 'Wiki', 'View wiki pages', NOW(), NOW()),
('/api/v1/projects/{projectId}/wiki', 'POST', 'Wiki', 'Add wiki pages', NOW(), NOW()),
('/api/v1/projects/{projectId}/wiki/{pageId}', 'PUT', 'Wiki', 'Modify wiki pages', NOW(), NOW()),
('/api/v1/projects/{projectId}/wiki/{pageId}', 'DELETE', 'Wiki', 'Delete wiki pages', NOW(), NOW()),
('/api/v1/projects/{projectId}/wiki/{pageId}/links', 'POST', 'Wiki', 'Add wiki links', NOW(), NOW()); 