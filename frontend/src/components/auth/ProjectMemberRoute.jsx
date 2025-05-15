import { useState, useEffect } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';
import { getCurrentUserId } from '../../utils/AuthUtils';
import Loading from '../../pages/Loading';
import ErrorPage, { ERROR_TYPE } from '../../pages/ErrorPage';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * A route guard that checks if the current user is a member of the project
 * before rendering the child components
 */
const ProjectMemberRoute = ({ children }) => {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const checkMembership = async () => {
            try {
                if (!projectId) {
                    setError('Project ID is required');
                    setLoading(false);
                    return;
                }

                const userId = getCurrentUserId();
                if (!userId) {
                    setError('User ID not available');
                    setLoading(false);
                    return;
                }

                console.log(`Checking membership for user ${userId} in project ${projectId}`);

                // Check if user is a project member
                const response = await fetchWithAuth(
                    `${BASE_API_URL}/v1/projects/${projectId}/check-membership`,
                    '/projects',
                    true,
                    {
                        method: 'GET',
                    }
                );

                if (!response) {
                    setError('Authentication required');
                    setLoading(false);
                    return;
                }

                // Log full response for debugging
                const responseClone = response.clone();
                const responseText = await responseClone.text();
                console.log('Membership check response:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: [...response.headers.entries()],
                    body: responseText
                });

                if (response.status === 403) {
                    console.warn(`User ${userId} is not a member of project ${projectId}`);
                    setIsMember(false);
                    setLoading(false);
                    return;
                }

                if (!response.ok) {
                    setError(`Error checking project membership: ${response.statusText}`);
                    setLoading(false);
                    return;
                }

                try {
                    const data = JSON.parse(responseText);
                    console.log('Parsed membership data:', data);

                    // Extract the boolean value from the nested structure
                    if (data && data.data && data.data.data === true) {
                        console.log('User is a member of this project');
                        setIsMember(true);
                    } else {
                        console.warn('User is not a member according to data:', data);
                        setIsMember(false);
                    }
                } catch (parseErr) {
                    console.error('Error parsing membership response:', parseErr);
                    setError('Invalid response format from server');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error checking project membership:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        checkMembership();
    }, [projectId]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorPage errorType={ERROR_TYPE.UNKNOWN_ERROR} errorMessage={error} />;
    }

    if (!isMember) {
        console.error(`Access denied: User is not a member of project ${projectId}`);

        // Show toast notification
        toast.error('You do not have access to this project');

        // Redirect to projects page
        return <Navigate to="/projects" state={{ from: location, error: 'You are not a member of this project' }} replace />;
    }

    console.log(`Access granted: User is a member of project ${projectId}`);
    return children;
};

export default ProjectMemberRoute; 