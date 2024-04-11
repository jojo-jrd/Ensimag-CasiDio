import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';

function RegisterView(){
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const birthDateRef = useRef(null);
  const [erreurMessage, setErreurMessage] = useState("");
  const {changePage} = useContext(AppContext)

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
        const reponse = await (await fetch(`${import.meta.env.VITE_API_URL}/register`, 
            {
                method:'POST',
                headers:{'Content-type':'application/json'},
                body: JSON.stringify({
                  firstName : firstNameRef.current.value,
                  lastName : lastNameRef.current.value,
                  email : emailRef.current.value,
                  password : passwordRef.current.value,
                  birthDate : birthDateRef.current.value
                })
            })).json()
        if (reponse.status == 200) {
          changePage('login')
        }
    }
  }
  return (
    <div>
      <fieldset>
        <legend>Inscrivez vous</legend>
        <label>First name</label>
        <input ref={firstNameRef} type="text"/>
        <label>Last name</label>
        <input ref={lastNameRef} type="text"/>
        <label>Email</label>
        <input ref={emailRef} type="text"/>
        <label>Password</label>
        <input ref={passwordRef} type="password"/>
        <label>Birth date</label>
        <input ref={birthDateRef} type="date"/>
        <button onClick={verifie}>Register</button>
        <span style={{color:"red"}}> {erreurMessage}</span>
      </fieldset>
      <div>
        <p>Déjà un compte ? <a onClick={() => changePage('login')}>Connectez vous !</a></p>
      </div>
    </div>
  )
}

export default RegisterView