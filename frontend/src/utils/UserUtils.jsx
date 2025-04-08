export const renderAvatar = (userData) => {
    if (!userData) return null;

    const avatarUrl = userData.avatarUrl;
    if (!avatarUrl) {
        return (
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                {userData.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
        );
    }

    return (
        <img
            src={avatarUrl}
            alt="User avatar"
            className="h-8 w-8 rounded-full"
        />
    );
};