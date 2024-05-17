import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import LogoCasiDio from './../../assets/logo_casidio.png';

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
    if (!emailRef.current?.value?.match(/[a-z0-9]{3,10}/)) {
      message += "Le login est incorrect."
    }
    if (passwordRef.current?.value?.length < 6) {
      message += "Mot de passe trop court."
    }
    if (!firstNameRef?.current?.value  || 
        !lastNameRef?.current?.value ||
        !emailRef?.current?.value ||
        !passwordRef?.current?.value ||
        !birthDateRef?.current?.value) {
        message += "Vous devez remplir tous les champs."
      }
    setErreurMessage(message)
    if (message.length===0) {
        fetch(`${import.meta.env.VITE_API_URL}/register`, 
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
            }).then(res => res.json()).then(reponse => {
              if (reponse.status) {
                changePage('login')
              } else {
                setErreurMessage(reponse?.message);
              }
            }).catch(error => {
              console.error(error)
            })
    }
  }
  return (
    <>
      <div className="flex items-center justify-center w-full">
        <div className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
          <div className="mb-4 flex justify-center">
            <img className="w-32" src={LogoCasiDio} alt="Logo CasiDio"/>
          </div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Inscrivez-vous</h2>
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="firstname">Prénom</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="firstname" ref={firstNameRef} type="text" />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="lastname">Nom</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="lastname" ref={lastNameRef} type="text" />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="birthdate">Date de naissance</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="birthdate" ref={birthDateRef} type="date" />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="email" ref={emailRef} type="email" />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="password">Mot de passe</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="password" ref={passwordRef} type="password" />
          </div>
          <span className="text-red-500 text-xs italic"> {erreurMessage}</span>
          <div className="flex items-center justify-between">
            <button data-cy="validate-register" className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={verifie}>Se connecter</button>
            <p className="inline-block align-baseline font-bold text-sm text-white">Déjà un compte ? <a className="text-blue-700 cursor-pointer" onClick={() => changePage('login')}> Connectez vous !</a></p>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterView