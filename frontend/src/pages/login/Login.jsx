import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import NavBar from '../../components/navbar/Navbar';

function LoginView() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [erreurMessage, setErreurMessage] = useState("");
  const { setToken, changePage, setUserConnected } = useContext(AppContext)

  async function verifie() {
    let message = ""
    if (!emailRef.current.value.match(/[a-z0-9]{3,10}/)) {
      message += "Le login est incorrect."
    }
    if (passwordRef.current.value.length < 6) {
      message += "Mot de passe trop court."
    }
    setErreurMessage(message)
    if (message.length === 0) {
      fetch(`${import.meta.env.VITE_API_URL}/login`,
        {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({
            email: emailRef.current.value,
            password: passwordRef.current.value
          })
        }).then(res => res.json()).then(async reponse => {
          if(reponse.token) {
            setToken(reponse.token);
            const user = await (await fetch(`${import.meta.env.VITE_API_URL}/api/user`,
              {
                method: 'GET',
                headers: { 'Content-type': 'application/json', 'x-access-token' : reponse.token},
              })).json()
            setUserConnected(user.data);
            localStorage.setItem('token', reponse.token);
            localStorage.setItem('user', JSON.stringify(user.data));
            changePage('home');
          } else {
            setErreurMessage(reponse.message);
          }
        }).catch(err => console.error(err));
    }
  }
  return (
    <>
      <NavBar/>
      <div className="flex items-center justify-between w-full">
        <div className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
            <div className="mb-4">
              <h2>Connectez-vous</h2>
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
            <button data-cy="validate-login" className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={verifie}>Se connecter</button>
            <p className="inline-block align-baseline font-bold text-sm text-white">Pas encore de compte ? <a className="text-blue-700 cursor-pointer" onClick={() => changePage('register')}>Créez en un !</a></p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginView