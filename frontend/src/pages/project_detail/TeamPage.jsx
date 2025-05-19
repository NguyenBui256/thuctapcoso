import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemberSidebar from './MemberSidebar';
import MemberContent from './MemberContent';
import MemberRoleManager from '../../components/project/MemberRoleManager';
import { fetchWithAuth, getCurrentUserId } from '../../utils/AuthUtils';
import { fetchProjectMembers } from '../../utils/api';
import { BASE_API_URL } from '../../common/constants';

const TeamPage = () => {
  const { projectId } = useParams();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [sortOption, setSortOption] = useState('none');
  const [sortDirection, setSortDirection] = useState('desc');
  const userId = getCurrentUserId();
  const [currentUser, setCurrentUser] = useState(null);
  const [showRoleManager, setShowRoleManager] = useState(false);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const membersData = await fetchProjectMembers(projectId);

        // Extract unique teams (roles) from members
        const uniqueTeams = [...new Set(membersData.map(member => member.roleName || 'Unknown'))];
        setTeams(['ALL', ...uniqueTeams]);

        setMembers(membersData);
        setFilteredMembers(membersData);

        // Find current user in members
        const current = membersData.find(member => member.userId.toString() === userId);
        setCurrentUser(current || null);

        // Log member data to debug
        console.log('Current user data:', current);
        console.log('All members data:', membersData);
      } catch (err) {
        setError('Failed to load team members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && projectId) {
      fetchMembers();
    }
  }, [projectId, userId]);

  // Helper function to get the number of badges for a member (for mock data)
  const getBadgeCount = (userId) => {
    if (!userId) return 0;
    // Mock badge count based on userId (last digit modulo 3 + 1)
    const num = parseInt(userId.toString().slice(-1)) % 3 + 1;
    return num;
  };

  // Filter and sort members based on search term, selected team, and sorting options
  useEffect(() => {
    let filtered = [...members];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.userFullName && member.userFullName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by team (role)
    if (selectedTeam !== 'ALL') {
      filtered = filtered.filter(member => member.roleName === selectedTeam);
    }

    // Sort by selected option
    if (sortOption !== 'none') {
      filtered.sort((a, b) => {
        let valueA, valueB;

        if (sortOption === 'power') {
          valueA = a.totalPoint || 0;
          valueB = b.totalPoint || 0;
        } else if (sortOption === 'badges') {
          valueA = getBadgeCount(a.userId);
          valueB = getBadgeCount(b.userId);
        }

        if (sortDirection === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }

    setFilteredMembers(filtered);
  }, [searchTerm, selectedTeam, sortOption, sortDirection, members]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  const handleSort = (option, direction) => {
    setSortOption(option);
    setSortDirection(direction);
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/leave`,
        `/projects`,
        true,
        { method: 'POST' }
      );

      if (response && response.ok) {
        window.location.href = '/projects';
      } else {
        setError('Failed to leave project');
      }
    } catch (err) {
      setError('Failed to leave project');
      console.error(err);
    }
  };

  const handleInviteMember = async (email, role) => {
    try {
      // This would be an actual API call in the future
      console.log('Inviting member with email:', email, 'and role:', role);

      // Mock API call for now
      // In a real application, you would call an API endpoint to send an invitation
      // return await fetchWithAuth(
      //   `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/invite`,
      //   `/projects/${projectId}/team`,
      //   true,
      //   {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ email, role })
      //   }
      // );

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demonstration, just return a mock success response
      return { ok: true };
    } catch (err) {
      console.error('Failed to invite member:', err);
      throw err;
    }
  };

  // Handle role update
  const handleRoleUpdate = (updatedMembers) => {
    // Update members list
    setMembers(updatedMembers);

    // Extract updated teams from members
    const uniqueTeams = [...new Set(updatedMembers.map(member => member.roleName || 'Unknown'))];
    setTeams(['ALL', ...uniqueTeams]);
  };

  // Toggle role manager
  const toggleRoleManager = () => {
    setShowRoleManager(!showRoleManager);
  };

  return (
    <div className="flex h-full w-full">
      {/* Member Sidebar */}
      <MemberSidebar
        className="flex-shrink-0 w-64 h-full flex-col overflow-y-auto border-r border-gray-200 bg-white"
        teams={teams}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        onSearch={handleSearch}
        onSort={handleSort}
        showRoleManagement={currentUser?.isAdmin || currentUser?.roleName === "PROJECT_MANAGER"}
        onManageRoles={toggleRoleManager}
      />

      {/* Main Member Content Area */}
      <div className="flex-1 overflow-y-auto">
        <MemberContent
          members={filteredMembers}
          currentUser={currentUser}
          loading={loading}
          error={error}
          onLeaveProject={handleLeaveProject}
          onInviteMember={handleInviteMember}
          projectId={projectId}
          sortOption={sortOption}
          sortDirection={sortDirection}
        />
      </div>

      {/* Role Manager Modal */}
      {showRoleManager && (
        <MemberRoleManager
          projectId={projectId}
          userId={userId}
          onClose={toggleRoleManager}
          onRoleUpdate={handleRoleUpdate}
        />
      )}
    </div>
  );
};

export default TeamPage;