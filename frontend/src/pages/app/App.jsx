import { useEffect, useState } from 'react'
import './App.css'
import { AppContext } from '../../AppContext';
import LoginView from '../login/Login';
import SlotMachineView from '../slot_machine/SlotMachine';
import MineGameView from '../mines/MineGame';
import RouletteView from '../roulette/Roulette';

import HomeView from '../home/Home';
import RegisterView from '../register/Register';
import DashBoardView from '../dashboard/Dashboard';
import NavBar from './../../components/navbar/Navbar';
import QuestionAPI from './../../components/questionAPI/QuestionAPI';
import AdminUsers from '../admin_users/AdminUsers';
import ProfilView from '../profil/Profil';


function App() {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("");
  const [userConnected, setUserConnected] = useState({});

  useEffect(() => {
    setPage(localStorage.getItem("page")); // TODO remettre
    setToken(localStorage.getItem("token"));
    setUserConnected(JSON.parse(localStorage.getItem("user") || '{}'));
  }, [])

  function changePage(to) {
    // Redirection si déconnection ou page non autorisé
    if (['login', 'register', 'logout'].includes(to)) {
      if (to == 'logout') {
        to = 'login';
      }
      localStorage.setItem('token', "");
      localStorage.setItem('user', JSON.stringify({}));
      setToken("");
      setUserConnected({});
    } else if (!['login', 'home', 'register'].includes(to) && !token) {
      to = 'login';
    }
    // stockant aussi la page demandée
    localStorage.setItem("page",to);
    setPage(to);
  }

  function getCurrentPage(){
    

    switch(page){
      case 'login' : return <LoginView/>;
      case 'register' : return <RegisterView/>;
      case 'SlotMachine' : return <SlotMachineView/>;
      case 'MineGame' : return <MineGameView/>;
      case 'home' : return <HomeView/>;
      case 'adminUsers' : return <AdminUsers/>
      case 'dashboard' : return <DashBoardView/>;
      case 'profil' : return <ProfilView/>;
      default: return <LoginView/>; // TODO: mettre Login
    }
  }

  return (
    <AppContext.Provider value = {{token, setToken, changePage, setUserConnected, userConnected}}>
      <NavBar />
      {getCurrentPage()}
      {/* <QuestionAPI openModal={true} setOpenModal={() => {}}/>  */}
      {/* TODO: */}
    </AppContext.Provider>
  )
}

export default App
