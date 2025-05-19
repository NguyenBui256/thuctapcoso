import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuthenticated } from '../../utils/AuthUtils';
import Loading from '../../pages/Loading';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = await checkAuthenticated();
            setIsAuthenticated(authenticated);
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        // Save the current location to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 