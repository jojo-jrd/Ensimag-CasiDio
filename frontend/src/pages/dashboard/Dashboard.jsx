import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../AppContext';
import Chart from 'chart.js/auto';
import Viardot from './../../assets/viardot-coin.png';

function DashBoardView(){
  const {userConnected, token } = useContext(AppContext);
  const [modeIsAdmin, setModeIsAdmin] = useState(false);
  let route = '/api/history';

  const [dataDashboard, setDataDashboard] = useState({
    'evolutionSolde' : [],
    'evolutionSoldeWeek' : 0.0,
  });

  async function updateModeAdmin() {
    // On fait !modeIsAdmin car après le setModeIsAdmin
    // La variable n'a pas encore changé de valeur
    route = !modeIsAdmin ? '/api/globalHistory' : '/api/history';
    await setModeIsAdmin(!modeIsAdmin);
    loadData();
  }

  async function loadData() {
    let data = [];
    const reponse = await (await fetch(`${import.meta.env.VITE_API_URL}${route}`, { method : 'GET',
      headers : {
        'x-access-token' : token
    }})).json();
    setDataDashboard(reponse?.['data'] || {});
    if (reponse?.['data']?.['evolutionSolde']) {
      data = reponse['data']['evolutionSolde'];
    } else {
      console.error(reponse.message);
    }
    Chart.defaults.color = "#fff";
    Chart.defaults.borderColor = "#324258";
    if(Chart.getChart("chart")) {
      Chart.getChart("chart")?.destroy()
    }
    new Chart(
      'chart',
      {
        type: 'line',
        data: {
          labels: data.map(row => row.date),
          datasets: [
            {
              label: 'Evolution du solde',
              data: data.map(row => row.total_amount),
              borderColor : "#FF9F40",
              backgroundColor : "#FF9F40"
            }
          ]
        }
      }
    );
  }

  useEffect(() => {
    loadData();
    return () => {
      Chart.getChart("chart")?.destroy()
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 m-4">
        {
          userConnected.isAdmin ?
              <>
              <div className="col-span-4 md:col-span-1 mb-4 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8">
                <label className="block text-white text-sm font-bold mb-2" htmlFor="isAdmin">Mode Admin</label>
                <input className="shadow appearance-none border rounded py-2 px-2 focus:outline-none focus:shadow-outline" id="isAdmin" onChange={() => updateModeAdmin()} type="checkbox" checked={modeIsAdmin}/>
              </div>
              <div className="md:col-span-3">
              </div>
              </>
          : ''
        }
        <div className="col-span-4 md:col-span-2 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <h2 className="text-white text-xl font-bold">Solde actuel</h2>
            <p data-cy="balance" className={(userConnected.balance > 100 ? 'text-lime-500' : 'text-amber-500') +' inline'}>{userConnected.balance}</p>
            <img src={Viardot} alt="Viardot Money" className="w-10 ml-1 inline"/>
        </div>
        <div className="col-span-4 md:col-span-2 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <h2 className="text-white text-xl font-bold">Evolution du solde sur la dernière semaine</h2>
            <p className={(dataDashboard?.evolutionSoldeWeek?.total_amount >= 0 ? 'text-lime-500' : 'text-red-500') +' inline'}>{dataDashboard.evolutionSoldeWeek.total_amount ? dataDashboard.evolutionSoldeWeek.total_amount : 0}</p>
            <img src={Viardot} alt="Viardot Money" className="w-10 ml-1 inline"/>
        </div>
        <div className="col-span-4 bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full h-full">
            <h2 className="text-white text-xl font-bold">Evolution du solde</h2>
            <canvas id="chart"></canvas>
        </div>
      </div>
    </div>
  )
}

export default DashBoardView