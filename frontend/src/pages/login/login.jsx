import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';

function LoginView(){
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [erreurMessage, setErreurMessage] = useState("");
  const {setToken, changePage} = useContext(AppContext)

  async function verifie(){
    let message = ""
    if (!emailRef.current.value.match(/[a-z0-9]{3,10}/)) {
      message += "Le login est incorrect."
    }
    if (passwordRef.current.value.length < 6) {
      message += "Mot de passe trop court."
    }
    setErreurMessage(message)
    if (message.length===0) {
        const reponse = await (await fetch(`${import.meta.env.VITE_API_URL}/login`, 
            {
                method:'POST',
                headers:{'Content-type':'application/json'},
                body: JSON.stringify({
                    email : emailRef.current.value,
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
      <label>Email</label>
      <input ref={emailRef} type="text"/>
      <label>Password</label>
      <input ref={passwordRef} type="password"/>
      <button onClick={verifie}>Connect</button>
      <span style={{color:"red"}}> {erreurMessage}</span>
    </fieldset>
  )
}

export default LoginView