import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemberSidebar from './MemberSidebar';
import MemberContent from './MemberContent';
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
  const userId = getCurrentUserId();
  const [currentUser, setCurrentUser] = useState(null);

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

  // Filter members based on search term and selected team
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
    
    setFilteredMembers(filtered);
  }, [searchTerm, selectedTeam, members]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
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

  return (
    <div className="flex h-full w-full">
      {/* Member Sidebar */}
      <MemberSidebar 
        className="flex-shrink-0 w-64 h-full flex-col overflow-y-auto border-r border-gray-200 bg-white"
        teams={teams} 
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        onSearch={handleSearch}
      />
      
      {/* Main Member Content Area */}
      <div className="flex-1 overflow-y-auto">
        <MemberContent 
          members={filteredMembers}
          currentUser={currentUser}
          loading={loading}
          error={error}
          onLeaveProject={handleLeaveProject}
        />
      </div>
    </div>
  );
};

export default TeamPage; 