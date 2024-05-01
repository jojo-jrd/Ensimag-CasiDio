import { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../AppContext';
import NavBar from '../../components/navbar/Navbar';
import Chart from 'chart.js/auto';

function DashBoardView({ isAdmin = false}){
  const {changePage, userConnected } = useContext(AppContext);
  const filterRef = useRef(null);
  const [actualSolde, setActualSolde] = useState(0.0);
  const [evolutionSoldeWeek, setEvolutionSoldeWeek] = useState(0.0);

  useEffect(() => {
    // TODO récupération des données avec la route
    const data = [
        { label: 2010, data: 10 },
        { label: 2011, data: 20 },
        { label: 2012, data: 15 },
        { label: 2013, data: 25 },
        { label: 2014, data: 22 },
        { label: 2015, data: 30 },
        { label: 2016, data: 28 },
      ];

    Chart.defaults.color = "#fff";
    Chart.defaults.borderColor = "#324258";
    Chart.color
    const myChart = new Chart(
        'chart',
        {
          type: 'line',
          data: {
            labels: data.map(row => row.label),
            datasets: [
              {
                label: 'Evolution du solde',
                data: data.map(row => row.data),
                borderColor : "#FF9F40",
                backgroundColor : "#FF9F40"
              }
            ]
          }
        }
      );
      return () => {
        myChart.destroy()
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
            <h2 className="text-xl font-bold">Solde actuel</h2>
            <p className={actualSolde > 100 ? 'text-lime-500' : 'text-red-500'}>{actualSolde} Viardot</p>
        </div>
        <div className="col-span-4 md:col-span-2 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <h2 className="text-xl font-bold">Evolution du solde sur la dernière semaine</h2>
            <p className={evolutionSoldeWeek >= 0 ? 'text-lime-500' : 'text-red-500'}>{(evolutionSoldeWeek >= 0 ? '+ ' : '- ') + evolutionSoldeWeek} Viardot</p>
        </div>
        <div className="col-span-4 md:col-span-1 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <div className="mb-4">
                <h2 className="text-xl font-bold">Une data</h2>
                <p>???</p>
            </div>
            <div className="mb-4">
                <h2 className="text-xl font-bold">Une autre</h2>
                <p>???</p>
            </div>
        </div>
        <div className="col-span-4 md:col-span-3 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <h2 className="text-xl font-bold">Evolution du solde</h2>
            <canvas id="chart"></canvas>
        </div>
      </div>
    </div>
  )
}

export default DashBoardView