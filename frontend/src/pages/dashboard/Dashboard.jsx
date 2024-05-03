import { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../AppContext';
import NavBar from '../../components/navbar/Navbar';
import Chart from 'chart.js/auto';
import moment from 'moment';

function DashBoardView({ isAdmin = false}){
  const {changePage, userConnected, token } = useContext(AppContext);
  const filterRef = useRef(null);
  const [evolutionSoldeWeek, setEvolutionSoldeWeek] = useState(0.0);

  useEffect(() => {
    var myChart;
    async function loadData() {
      let data = [];
      const reponse = await (await fetch(`${import.meta.env.VITE_API_URL}/api/history`, { method : 'GET',
        headers : {
          'x-access-token' : token
      }})).json();
      if (reponse?.['data']) {
        data = reponse['data'];
      } else {
        console.error(reponse.message);
      }
      Chart.defaults.color = "#fff";
      Chart.defaults.borderColor = "#324258";
      if(Chart.getChart("chart")) {
        Chart.getChart("chart")?.destroy()
      }
      myChart = new Chart(
        'chart',
        {
          type: 'line',
          data: {
            labels: data.map(row => moment(row.gameDate).format('L')),
            datasets: [
              {
                label: 'Evolution du solde',
                data: data.map(row => row.profit),
                borderColor : "#FF9F40",
                backgroundColor : "#FF9F40"
              }
            ]
          }
        }
      );
    }
    loadData();

    return () => {
      Chart.getChart("chart")?.destroy()
    }
  }, [])

  return (
    <div>
      <NavBar/>
      <div className="grid grid-cols-4 gap-4 m-4">
        {/* Bloc de filtre */}
        <div className="col-span-4 md:col-span-2 md:col-start-2 bg-gray-800 shadow-md rounded px-8 py-6 w-full h-full md relative">
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="TODO Voir filtre" ref={filterRef} />
        </div>

        <div className="col-span-4 md:col-span-2 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full md">
            <h2 className="text-white text-xl font-bold">Solde actuel</h2>
            <p className={userConnected.balance > 100 ? 'text-lime-500' : 'text-red-500'}>{userConnected.balance} Viardot</p>
        </div>
        <div className="col-span-4 md:col-span-2 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <h2 className="text-white text-xl font-bold">Evolution du solde sur la dernière semaine</h2>
            <p className={evolutionSoldeWeek >= 0 ? 'text-lime-500' : 'text-red-500'}>{(evolutionSoldeWeek >= 0 ? '+ ' : '- ') + evolutionSoldeWeek} Viardot</p>
        </div>
        <div className="col-span-4 md:col-span-1 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <div className="mb-4">
                <h2 className="text-white text-xl font-bold">Une data</h2>
                <p className="text-gray-400">???</p>
            </div>
            <div className="mb-4">
                <h2 className="text-white text-xl font-bold">Une autre</h2>
                <p className="text-gray-400">???</p>
            </div>
        </div>
        <div className="col-span-4 md:col-span-3 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <h2 className="text-white text-xl font-bold">Evolution du solde</h2>
            <canvas id="chart"></canvas>
        </div>
      </div>
    </div>
  )
}

export default DashBoardView