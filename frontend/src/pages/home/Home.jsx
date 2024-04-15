import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import avatar from './../../assets/avatar.png';
import slotMachine from './../../assets/slot-machine.png';
import Card from './../../components/card/Card';
import Drowpdown from '../../components/dropdown/Dropdown';

function HomeView(){
  const {changePage, userConnected } = useContext(AppContext);
  const [displayDropDown, setDisplayDropDown] = useState(false);

  return (
    <div>
      <header className="w-full p-1.5 sticky flex justify-between">
        <div>
            LOGO CasiDio
        </div>
        <div className="flex" onClick={() => setDisplayDropDown(!displayDropDown)}>
          <img className="w-9 mr-1" src={avatar} alt="Image Avatar"/>
          {userConnected.firstName}
        </div>
        <Drowpdown submenus={[
          { page : 'test', name : 'Profil'},
          { page : 'login', name : 'Deconnection'}
        ]} display={displayDropDown} changePage={(page) => changePage(page)}/>
      </header>
      <div className="flex justify-arround flex-col sm:flex-row">
        <Card title="SlotMachine" image={slotMachine} 
          description="A slot Machine" pageClick={null}/>
        <Card title="Mines"/>
        <Card title="Rocket"/>
      </div>
    </div>
  )
}

export default HomeView