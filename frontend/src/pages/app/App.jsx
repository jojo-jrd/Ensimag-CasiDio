import { useState } from 'react'
import './App.css'
import { AppContext } from '../../AppContext';
import LoginView from '../login/Login';
import HomeView from '../home/Home';
import RegisterView from '../register/Register';

function App() {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("");
  const [userConnected, setUserConnected] = useState({});

  function changePage(to){ 
    // stockant aussi la page demandée
    localStorage.setItem("page",to);
    // En plus de changer l'état
    setPage(to);
  }

  function getCurrentPage(){
    switch(page){
      case 'login' : return <LoginView/>;
      case 'register' : return <RegisterView/>;
      case 'home' : return <HomeView/>;
      default: return <HomeView/>; // TODO: mettre Login
    }
  }

  return (
    <AppContext.Provider value = {{token, setToken, changePage, setUserConnected, userConnected}}>
      {getCurrentPage()}
    </AppContext.Provider>
  )
}

export default App
