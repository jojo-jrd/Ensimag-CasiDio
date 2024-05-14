import { useState, useEffect } from 'react';
import Card from './../../components/card/Card';

function HomeView(){
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function loadGames() {
      const reponse = await (await fetch(`${import.meta.env.VITE_API_URL}/games`, { method : 'GET'})).json();
      if (reponse?.['data']) {
        setGames(reponse['data']);
      } else {
        console.error(reponse.message);
      }
    }
    loadGames();
  },[])

  return (
    <div>
      <div className="flex justify-arround flex-col sm:flex-row">
        { games.map((game) =>  {
            return <Card key={game.id} title={game.name} pageClick={game.page}
            description={game.description} image={game.picturePath}/>
          })}
      </div>
    </div>
  )
}

export default HomeView