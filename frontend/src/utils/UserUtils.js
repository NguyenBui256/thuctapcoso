/**
 * Get user initials from full name or username
 * @param {string} fullName - The full name or username
 * @returns {string} User initials (1-2 characters)
 */
export const getUserInitials = (fullName) => {
    if (!fullName) return 'U';

    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
        // Only one name, take first letter
        return parts[0].charAt(0).toUpperCase();
    } else {
        // Multiple names, take first letter of first and last name
        const firstInitial = parts[0].charAt(0);
        const lastInitial = parts[parts.length - 1].charAt(0);
        return (firstInitial + lastInitial).toUpperCase();
    }
};

/**
 * Render avatar for user
 * @param {Object} userData - User data with username and avatar properties
 * @returns {JSX.Element|null} Avatar JSX element or null
 */
export const renderAvatar = (userData) => {
    if (!userData) return null;

    const avatarUrl = userData.avatarUrl || userData.photoUrl;
    if (!avatarUrl) {
        return getUserInitials(userData.fullName || userData.username);
    }

    return avatarUrl;
}; 