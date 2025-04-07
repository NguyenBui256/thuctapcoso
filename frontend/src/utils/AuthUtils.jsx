import { BASE_API_URL } from "../common/constants"

export async function checkAuthenticated() {
    try {
        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
            // Try to refresh token
            const ref = await fetch(`${BASE_API_URL}/v1/auth/refresh`, {
                credentials: "include"
            })
            if (ref.status !== 200) return false

            const data = await ref.json()
            localStorage.setItem("access_token", data.token)
            setUserData(data.token)
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

        if (!res.ok) {
            if (res.status === 401) {
                const ref = await fetch(`${BASE_API_URL}/v1/auth/refresh`, {
                    credentials: "include"
                })

                if (ref.status !== 200) {
                    if (isCompulsory) {
                        window.location.assign('/login' + `${from ? '?from=' + from : ''}`)
                    }
                    return null
                }

                const data = await ref.json()
                localStorage.setItem("access_token", data.token)
                setUserData(data.token)

                // Retry the original request with new token
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${data.token}`,
                    },
                    credentials: 'include'
                })
            }
            return res
        }
        return res
    } catch (error) {
        console.error('Error in fetchWithAuth:', error)
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
            fullName: payload.fullName
        }
        localStorage.setItem("userData", JSON.stringify(userData))
    }
    catch (err) {
        console.log(err)
    }
}

export const logout = async () => {
    await fetchWithAuth(`${BASE_API_URL}/v1/auth/logout`, null, false, {
        method: "POST",
        credentials: "include",
    })
    await localStorage.removeItem("access_token")
    await localStorage.removeItem("userData")
    await localStorage.removeItem("cart")
    window.location.assign("/")
}