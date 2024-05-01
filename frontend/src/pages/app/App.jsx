import { useEffect, useState } from 'react'
import './App.css'
import { AppContext } from '../../AppContext';
import LoginView from '../login/Login';
import SlotMachineView from '../slot_machine/SlotMachine';
import HomeView from '../home/Home';
import RegisterView from '../register/Register';
import DashBoardView from '../dashboard/Dashboard';

function App() {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("");
  const [userConnected, setUserConnected] = useState({});

  useEffect(() => {
    //setPage(localStorage.getItem("page")); TODO remettre
  })

  function changePage(to){ 
    // stockant aussi la page demandée
    localStorage.setItem("page",to);
    // Supprission du token si déconnexion
    if(['login', 'register'].includes(to)) {
      setToken(null);
      setUserConnected({});
    }

    setPage(to);
  }

  function getCurrentPage(){
    switch(page){
      case 'login' : return <LoginView/>;
      case 'register' : return <RegisterView/>;
      case 'slot-machine' : return <SlotMachineView/>;
      case 'home' : return <HomeView/>;
      case 'dashboard' : return <DashBoardView/>;
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
