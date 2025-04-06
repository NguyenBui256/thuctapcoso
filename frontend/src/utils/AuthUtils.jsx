import { BASE_API_URL } from "../common/constants"

export async function checkAuthenticated(){
    var ok = false
    try{
        const userData = JSON.parse(localStorage.getItem('userData'))
        if(userData === null){
            const accessToken = localStorage.getItem("access_token")
            if(!accessToken) throw new Error("Access token missing")
            // const res = await fetch(`${BASE_API_URL}/v1/auth/ping`, {
            //     headers:{
            //         Authorization: `Bearer ${accessToken}`
            //     }
            // })
            setUserData(accessToken)
            // if(res.status !== 200) throw new Error("Cannot ping")
            ok = true
        }
        else ok = true
    }
    catch (err){
        // try{
        //     const ref = await fetch(`${BASE_API_URL}/v1/auth/refresh`, {
        //         credentials: "include"
        //     })
        //     if(ref.status !== 200) ok = false
        //     else{
        //         await ref.json()
        //         .then(data => {
        //             localStorage.setItem("access_token", data.token)
        //             setUserData(data.token)
        //             ok = true
        //         })
        //     }
        // }
        // catch(error){
        //     ok = false
        // }
        ok = false
    }
    return ok
}

export async function fetchWithAuth(url, from, isCompulsory, options = {}){
    const res = await fetch(url, {
        ...options,
        headers:{
            ...options.headers,
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
        }
    })
        .catch(err => {
            console.log(err.status)
            if(err.status === 403) window.location.assign("/error?error=UNAUTHORIZED")
        })
    if(!res.ok){
        if(res.status === 401){
            const ref = await fetch(`${BASE_API_URL}/v1/auth/refresh`, {
                credentials: "include"
            })
            if(ref.status !== 200){
                if(ref.status === 403)
                    window.location.assign("/")
                if(isCompulsory){
                    window.location.assign('/login' + `${from ? '?from=' + from : ''}`)
                }
            }
            else{
                const resJson = await ref.json()
                localStorage.setItem("access_token", resJson.token)
                setUserData(resJson.token)
                return fetch(url, {
                    ...options,
                    headers:{
                        ...options.headers,
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    }
                });
            }
        }
        else{
            console.log("Unknown error fethWithAuth")
            return res
        }
    }
    else{
        return res
    }
}

export const setUserData = (accessToken) => {
    try{
        var base64Url = accessToken.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
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
    catch(err){
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