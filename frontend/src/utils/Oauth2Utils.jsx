import { BASE_BE_URL } from '../common/constants'

export function OpenOauthLoginPage(provider){
    window.location.assign(`${BASE_BE_URL}/oauth2/authorization/${provider}`)
}