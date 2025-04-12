import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BASE_API_URL } from "../../common/constants"
import { setUserData } from '../../utils/AuthUtils';
import Loading from '../Loading'

function sendApi(provider, code) {
  fetch(`${BASE_API_URL}/v1/auth/oauth?provider=${provider}&code=${code}`, {
    method: "POST",
    credentials: "include"
  })
    .then(res => {
      if (res.status != 200) {
        alert("Something wrong, please try again!")
        window.location.assign('/login')
      }
      else {
        res.json()
          .then(data => {
            localStorage.setItem("access_token", data.data.token)
            setUserData(data.data.token)
          })
        const from = localStorage.getItem('from')
        localStorage.removeItem('from')
        window.location.assign(from ? from : '/')
      }
    }
    )
    .catch(err => {
      alert("Something wrong, please try again!")
      window.location.assign('/login')
    })
}

export default function HandleOauthRedirect() {

  const [params] = useSearchParams();

  const code = params.get('code');
  const provider = params.get('provider')

  useEffect(() => sendApi(provider, code))

  return (
    <Loading />
  );
}