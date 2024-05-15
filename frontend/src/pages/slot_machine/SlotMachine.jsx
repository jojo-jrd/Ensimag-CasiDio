import { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import $ from 'jquery';
import './SlotMachine.css'

const   nbIcones = 9,
        timeIcon = 100,
        iconSize = 80;
let     gameSocket,
        indexesColumns;
        
const isTest = import.meta.env.VITE_TEST == '1';
const valueTest = [
    {
        deltas : [5, 5, 5],
        finalIndexes : [5, 5, 5],
        state :  'bigWIN'
    },
    {
        deltas : [6, 6, 5],
        finalIndexes : [6, 6, 5],
        state :  'win'
    },
    {
        deltas : [6, 5, 4],
        finalIndexes : [6, 5, 4],
        state :  'loose'
    }
]

function SlotMachineView() {
    const slotMachineEl = useRef();
    const [isClicked, setIsClicked] = useState(false);
    const { token, updateUserConnected } = useContext(AppContext);
    let nbLaunchTest = 0;

    useEffect(() => {
        // Define web socket and initial indexes
        gameSocket = new WebSocket(`${import.meta.env.VITE_API_WS}/gameSocket`);
        indexesColumns = [0, 0, 0];
        
        // Define web socket handler
        gameSocket.onmessage = (msg) => {
            let data;
            // Les web socket sont impossible à tester avec cypress
            // On change donc le résultat ici
            if (isTest) {
                data = valueTest[nbLaunchTest];
                nbLaunchTest++;
            } else {
                data = JSON.parse(msg.data);
            }

            // Check errors
            if (data.error) {
                console.error(msg.error);
                return;
            }
            
            // Rolls each column
            $(slotMachineEl.current).find('.column').map((columnIndex, htmlElement) => {
                rollColumn(columnIndex, htmlElement, data.deltas[columnIndex], afterRolls);
                indexesColumns[columnIndex] = data.finalIndexes[columnIndex];
            })

            // Check game state
            function afterRolls() {
                if (data.state === 'win') {
                    $(slotMachineEl.current).addClass('twoOnLine');
                    setTimeout(() => $(slotMachineEl.current).removeClass('twoOnLine'), 2000);
                } else if (data.state === 'bigWIN') {
                    $(slotMachineEl.current).addClass('threeOnLine');
                    setTimeout(() => $(slotMachineEl.current).removeClass('threeOnLine'), 2000);
                }
                // Update l'user pour savoir son nouveau solde
                updateUserConnected();
                
                setIsClicked(false);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    function rollColumn(offset, column, delta, callback) {
        const sizeBackgroundPositionY = parseFloat(column.style.backgroundPositionY) || 0;

        // Gestion de l'animation
        setTimeout(() => {
            column.style.transition = `background-position-y ${(8 + 1 * delta) * timeIcon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
            column.style.backgroundPositionY = (sizeBackgroundPositionY + delta * iconSize).toString() + 'px';
        }, offset * 150);

        setTimeout(() => {
            column.style.transition = `none`;
            column.style.backgroundPositionY = (sizeBackgroundPositionY + delta * iconSize % (nbIcones * iconSize)).toString() + 'px';

            if (offset == 2) // On the last roll, call the callback function
                callback()
        }, (8 + 1 * delta) * timeIcon + offset * 150);
    }

    function launchRoll() {
        setIsClicked(true);

        gameSocket.send(JSON.stringify({game: 'playSlotMachine', Payload: {nbIcons: nbIcones, indexesColumns: indexesColumns, betAmount: 10}, userToken: token}));
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