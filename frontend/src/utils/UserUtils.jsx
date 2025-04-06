export function renderAvatar(avatar, isRounded = false) {
    const roundClass = isRounded ? 'rounded-full' : 'rounded-none'

    if (avatar.startsWith('http')) {
        return (
            <img
                src={avatar}
                className={`w-full h-full object-cover ${roundClass}`}
            />
        )
    } else {
        const [avatarId, colorCode] = avatar.split('.')
        return (
            <div className={`flex items-center justify-center w-full h-full bg-[#${colorCode.toLowerCase()}] ${roundClass}`}>
                <img
                    src={`/user_avatar/user-avatar-${avatarId}.png`}
                    className={`w-full h-full object-cover ${roundClass}`}
                />
            </div>
        )
    }
}