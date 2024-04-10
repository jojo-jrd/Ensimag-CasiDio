import { useState, useRef, useContext } from 'react'; 
import { AppContext } from '../../AppContext';

function LoginView(){
  const loginRef = useRef(null);
  const passwordRef = useRef(null);
  const [erreurMessage, setErreurMessage] = useState("");
  const {setToken, changePage} = useContext(AppContext)

  async function verifie(){
    let message = ""
    if (!loginRef.current.value.match(/[a-z0-9]{3,10}/)) {
      message += "Le login est incorrect."
    }
    if (passwordRef.current.value.length < 6) {
      message += "Mot de passe trop court."
    }
    setErreurMessage(message)
    if (message.length===0) {
        const reponse = await (await fetch("https://mon.app.org/login", 
            {
                method:'POST',
                headers:{'Content-type':'application/json'},
                body: JSON.stringify({
                    login : loginRef.current.value,
                    password : passwordRef.current.value
                })
            })).json()
        setToken(reponse.token);
        changePage('home');
    }
  }
  return (
    <fieldset>
      <legend>Connectez vous</legend>
      <label>Login</label>
      <input ref={loginRef} type="text"/>
      <label>Password</label>
      <input ref={passwordRef} type="password"/>
      <button onClick={verifie}>Connect</button>
      <span style={{color:"red"}}> {erreurMessage}</span>
    </fieldset>
  )
}

export default LoginView