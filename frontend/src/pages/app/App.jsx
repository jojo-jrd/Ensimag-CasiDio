import { useState } from 'react'
import './App.css'
import { AppContext } from '../../AppContext';
import LoginView from '../login/Login';
import RegisterView from '../register/Register'

function App() {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("");

  function changePage(to){ 
    // stockant aussi la page demandée
    localStorage.setItem("page",to) 
    // En plus de changer l'état
    setPage(to) 
  }

  function getCurrentPage(){
    switch(page){
      case 'login' : return <LoginView/> ;
      case 'register' : return <RegisterView/> ;
      default: return <LoginView/> 
    }
  }

  return (
    <AppContext.Provider value = {{token, setToken, changePage}}>
      {getCurrentPage()}
    </AppContext.Provider>
  )
}

export default App
