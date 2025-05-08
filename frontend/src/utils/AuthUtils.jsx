import { BASE_API_URL } from "../common/constants"

export async function checkAuthenticated() {
    try {
        const accessToken = localStorage.getItem("userData")
        if (!accessToken) {
            // Try to refresh token
            const ref = await fetch(`${BASE_API_URL}/v1/auth/refresh`, {
                credentials: "include"
            })
            if (ref.status !== 200) {
                await localStorage.removeItem('userData')
                return false
            }

            const data = await ref.json()
            localStorage.setItem("access_token", data.data.token)
            setUserData(data.data.token)
            return true
        }

        // If we have access token, verify it's valid
        setUserData(accessToken)
        return true
    } catch {
        return false
    }
}

export async function fetchWithAuth(url, from, isCompulsory, options = {}) {
    try {
        console.log("fetchWithAuth called with URL:", url, "method:", options.method || "GET");
        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
            if (isCompulsory) {
                window.location.assign('/login' + `${from ? '?from=' + from : ''}`)
                return null
            }
            return null
        }

        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include'
        })

        console.log("fetchWithAuth response:", url, "status:", res.status, "ok:", res.ok);

        if (!res.ok) {
            if (res.status === 401) {
                const ref = await fetch(`${BASE_API_URL}/v1/auth/refresh`, {
                    credentials: "include"
                })

                if (ref.status !== 200) {
                    await localStorage.removeItem('userData')
                    await localStorage.removeItem('access_token')
                    if (isCompulsory) {
                        window.location.assign('/login' + `${from ? '?from=' + from : ''}`)
                    }
                    return null
                }

                const data = await ref.json()
                localStorage.setItem("access_token", data.data.token)
                setUserData(data.data.token)

                // Retry the original request with new token
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${data.data.token}`,
                    },
                    credentials: 'include'
                })
            }
            return res
        }
        return res
    } catch (error) {
        console.error('Error in fetchWithAuth:', error, "URL:", url)
        if (isCompulsory) {
            window.location.assign('/login' + `${from ? '?from=' + from : ''}`)
        }
        return null
    }
}

export const setUserData = (accessToken) => {
    try {
        var base64Url = accessToken.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload)
        const userData = {
            username: payload.sub,
            avatarUrl: payload.avatar,
            email: payload.email,
            fullName: payload.fullName,
            userId: payload.userId || payload.id
        }
        localStorage.setItem("userData", JSON.stringify(userData))
        localStorage.setItem("userId", userData.userId)
    }
    catch (err) {
        console.log(err)
    }
}

export const getCurrentUserId = () => {
    // Try to get userId directly from localStorage
    const userId = localStorage.getItem("userId");
    if (userId) return userId;

    // If not found, try to extract from userData
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
        try {
            const userData = JSON.parse(userDataStr);
            if (userData.userId) {
                localStorage.setItem("userId", userData.userId);
                return userData.userId;
            }
        } catch (err) {
            console.error("Error parsing userData:", err);
        }
    }

    // Default fallback value if userId cannot be determined
    return null;
}

export const logout = async () => {
    await fetchWithAuth(`${BASE_API_URL}/v1/auth/logout`, null, false, {
        method: "POST",
        credentials: "include",
    })
    await localStorage.removeItem("access_token")
    await localStorage.removeItem("userData")
    await localStorage.removeItem("userId")
    await localStorage.removeItem("cart")
    window.location.assign("/")
}