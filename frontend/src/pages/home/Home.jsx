import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import avatar from './../../assets/avatar.png';
import slotMachine from './../../assets/slot-machine.png';
import Card from './../../components/card/Card';

function HomeView(){
  const {changePage, userConnected } = useContext(AppContext)
  return (
    <div>
      <header className="w-full p-1.5 static flex justify-between">
        <div>
            LOGO CasiDio
        </div>
        <div className="flex">
          <img className="w-9 mr-1" src={avatar} alt="Image Avatar"/>
          {userConnected.firstName}
        </div>
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