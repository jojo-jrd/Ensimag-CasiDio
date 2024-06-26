import { Modal } from "flowbite-react";
import { AppContext } from '../../AppContext';
import { useEffect, useState, useContext } from "react";
import PropTypes from 'prop-types';

let gameSocket;

const isTest = import.meta.env.VITE_TEST == '1';
const questionTest = [{
    state: "playing",
    question: "Qui est le meilleur de l'équipe ?",
    difficulty: "facile",
    category : "Divertissement",
    possibleAnswers : ["Jordan", "Lukas", "Clement", "Aucun"]
}, {
    state : "win"
}, {
    error : "Une erreur"
}, {
    state : "loose"
}]

function QuestionAPI({setOpenModal}) {
    const [question, setQuestion] = useState("");
    const [responses, setResponses] = useState([]);
    const [answerSelected, setAnswerSelected] = useState("");
    const [erreurMessage, setErreurMessage] = useState("");
    const [winMessage, setWinMessage] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [category, setCategory] = useState("");
    const [gameState, setGameState] = useState("");
    const { token, updateUserConnected } = useContext(AppContext);

    // Used for the test
    let nbQuestionTest = 0;

    const gameSocketHandler = (msg) => {
        let data;
        if (isTest) {
            data = questionTest[nbQuestionTest];
            nbQuestionTest++;
        } else {
           data = JSON.parse(msg.data)
        }

        // Handle errors
        if (data.error) {
            console.error(data.error);
            setErreurMessage(data.error);
            return;
        }

        // Handle initialization
        if (data.state === 'playing') {
            setQuestion(data.question);
            setDifficulty(data.difficulty);
            setCategory(data.category);
            setResponses(data.possibleAnswers);
            return;
        }

        setGameState('end');
        // Handle validation win
        if (data.state === 'win') {
            // Update l'user pour savoir son nouveau solde
            setWinMessage("Bonne réponse. Vous venez de gagner des Viardots.");
            updateUserConnected();
            return;
        }

        if (data.state === 'loose') {
            setErreurMessage('Dommage ! Mauvaise réponse');
            return;
        }
    }

    const initQuestion = () => {
        gameSocket.send(JSON.stringify({game: 'initQuestion', Payload: {}, userToken: token}));
        setErreurMessage('');
        setWinMessage('');
        setGameState('playing');
    }

    useEffect(() => {
        gameSocket = new WebSocket(`${import.meta.env.VITE_API_WS}/gameSocket`);
        gameSocket.onmessage = gameSocketHandler;
        
        gameSocket.onopen = initQuestion;
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    function validate() {
        gameSocket.send(JSON.stringify({game: 'playQuestion', Payload: {answer: answerSelected}, userToken: token}))
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    return (
        <Modal show={true} onClose={() => setOpenModal(false)}>
            <Modal.Header>Récupérer des Viardot</Modal.Header>
            <Modal.Body>
            <div className="space-y-6">
                <p className="text-center leading-relaxed text-black">
                    {decodeHtml(question)}
                </p>
                <div className="text-center">
                    <span className="bg-purple-100 text-purple-800 font-medium me-2 px-2.5 py-0.5 rounded capitalize">{decodeHtml(category)}</span>
                    <span className="bg-red-100 text-red-800 font-medium me-2 px-2.5 py-0.5 rounded capitalize">{decodeHtml(difficulty)}</span>
                </div>
                <div>
                { responses.map((reponse, i) =>  {
                    return (<div key={i}>
                        <input type="radio" id={reponse} name="question" value={reponse} onChange={() => setAnswerSelected(reponse)}/>
                        <label className="ml-4 text-black" htmlFor={reponse}>{decodeHtml(reponse)}</label>
                    </div>
                    )   
                })}
                </div>
            </div>
            <span className="text-red-500 text-xs italic"> {erreurMessage}</span>
            <span className="text-green-500 text-xs italic"> {winMessage}</span>
            </Modal.Body>
            <Modal.Footer>
                { gameState === 'playing' ? (
                    <button className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => validate()}>Valider</button>
                ) : (
                    <button className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => initQuestion()}>Rejouer</button>
                )}
                <button className="text-blue-700 hover:text-blue-800 rounded-lg font-bold py-2 px-4 rounded" onClick={() => setOpenModal(false)}>Quitter</button>
            </Modal.Footer>
        </Modal>
    );
}

QuestionAPI.propTypes = {
    setOpenModal : PropTypes.func,
}

export default QuestionAPI;