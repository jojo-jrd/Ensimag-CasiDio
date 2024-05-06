import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import NavBar from './../../components/navbar/Navbar';
import $ from 'jquery';
import './SlotMachine.css'
const TEST_LAUNCH = [
    [6, 6, 6],
    [2, 2, 1],
    [3, 4, 7]
];

function SlotMachineView() {
    const [indexesColumns, setIndexesColumns] = useState([0, 0, 0]);
    const slotMachineEl = useRef();
    const [isClicked, setIsClicked] = useState(false);
    const [nbLaunchTest, setNbLaunchTest] = useState(0);
    const nbIcones = 9,
        timeIcon = 100,
        iconSize = 80;
    

    function rollColumn(offset, column) {
            var delta;
            // GESTION DU TEST
            if (import.meta.env.VITE_TEST === '1') {
                delta = TEST_LAUNCH[nbLaunchTest][offset];
            } else {
                delta = (offset + 2) * nbIcones + Math.round(Math.random() * nbIcones);
            }
        
            return new Promise((resolve, reject) => {
                const sizeBackgroundPositionY = parseFloat(column.style.backgroundPositionY) || 0;
                // Gestion de l'animation
                setTimeout(() => {
                    column.style.transition = `background-position-y ${(8 + 1 * delta) * timeIcon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
                    column.style.backgroundPositionY = (sizeBackgroundPositionY + delta * iconSize).toString() + 'px';
                }, offset * 150);
        
                setTimeout(() => {
                    column.style.transition = `none`;
                    column.style.backgroundPositionY = (sizeBackgroundPositionY + delta * iconSize % (nbIcones * iconSize)).toString() + 'px';
                    resolve(delta % nbIcones);
                }, (8 + 1 * delta) * timeIcon + offset * 150);
        
            });
    }

    function launchRoll() {
        
        // TODO utiliser ? crédits

        setIsClicked(true);

        // Lancement de chaque colonne
        Promise.all($(slotMachineEl.current).find('.column').map((column, i) => rollColumn(column, i))).then((deltas) => {
            // Mise à jour des index en fonction de l'index précédent et du nouvel index
            deltas.forEach((delta, i) => indexesColumns[i] = (indexesColumns[i] + delta) % nbIcones);

            const hasWin = indexesColumns[0] == indexesColumns[1] || indexesColumns[1] == indexesColumns[2] || indexesColumns[0] == indexesColumns[2];
            // Si l'utilisateur a au moins 2 symboles alignés
            if (hasWin) {
                let className = 'twoOnLine';
                if (indexesColumns[0] == indexesColumns[1] && indexesColumns[1] == indexesColumns[2]) {
                    className = 'threeOnLine';
                    // TODO ajouter ? credit
                } else {
                    // TODO Ajouter ? credit
                }
                
                // Gestion de l'animation
                $(slotMachineEl.current).addClass(className);
                setTimeout(() => $(slotMachineEl.current).removeClass(className), 2000);
                
                // Incrémentation du test
                if (import.meta.env.VITE_TEST === '1') {
                    setNbLaunchTest(nbLaunchTest+1);
                }
            }
            setIsClicked(false);
        });
    }

    return (
        <div>
            <div className="mt-4 flex h-full justify-center items-center">
                <div className="max-w-lg w-full">
                    <div className="border border-solid border-red-700 bg-gray-800 rounded-lg p-8">
                        <h1 className="text-white text-4xl font-bold text-center mb-8">Machine à sous</h1>
                    <div ref={slotMachineEl} id="SlotMachine">
                        <div className="column"></div>
                        <div className="column"></div>
                        <div className="column"></div>
                    </div>
                    <button disabled={isClicked} onClick={() => launchRoll()} className="bg-red-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">Roll</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SlotMachineView;