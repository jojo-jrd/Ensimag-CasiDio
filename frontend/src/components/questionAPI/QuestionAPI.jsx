import { Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';

function QuestionAPI({openModal, setOpenModal}) {
    const [question, setQuestion] = useState("");
    const [responses, setResponses] = useState([]);
    const [rightAnswer, setRightAnswer] = useState("");
    const [answerSelected, setAnswerSelected] = useState("");
    const [erreurMessage, setErreurMessage] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [category, setCategory] = useState("");

    async function loadQuestions() {
        const resultAPI = await (await fetch("https://opentdb.com/api.php?amount=1&type=multiple", { method : 'GET'})).json();
        console.log(resultAPI);
        const results = resultAPI['results'];
        if(results?.length) {
            const result = results[0];
            // TODO gérer les plusieurs questions
            // TODO problème encodage
            setQuestion(result['question']);
            setDifficulty(result['difficulty']);
            setCategory(result['category']);
            var answers = result['incorrect_answers'];
            const correctAnswer = result['correct_answer'];
            setRightAnswer(correctAnswer);
            answers.splice(Math.floor(Math.random() * (answers.length + 1)), 0, correctAnswer);
            setResponses(answers);
        }else {
            // Problème : Relance la récupération d'une question
            // l'API ne fonctionne pas tous le temps
            setTimeout(() => {
                loadQuestions();
            }, 500);
        }
        
    }

    useEffect(() => {
        loadQuestions();
    }, [])

    function validate() {
        if(answerSelected) {
            if (answerSelected == rightAnswer) {
                // TODO correct
                setOpenModal(false);
            } else {
                setErreurMessage("Dommage ! Mauvaise réponse");
                loadQuestions();
                setTimeout(() => {
                    setErreurMessage("");
                }, 1000)
            }
        } else {
            setErreurMessage("Vous devez saisir une réponse");
        }
    }
    
    
  
    return (
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Récupérer des Viardot</Modal.Header>
            <Modal.Body>
            <div className="space-y-6">
                <p className="text-center leading-relaxed">
                    {question}
                </p>
                <div className="text-center">
                    <span className="bg-purple-100 text-purple-800 font-medium me-2 px-2.5 py-0.5 rounded capitalize">{category}</span>
                    <span className="bg-red-100 text-red-800 font-medium me-2 px-2.5 py-0.5 rounded capitalize">{difficulty}</span>
                </div>
                <div>
                { responses.map((reponse, i) =>  {
                    return (<div key={i}>
                        <input type="radio" id={reponse} name="question" value={reponse} onChange={() => setAnswerSelected(reponse)}/>
                        <label className="ml-4" htmlFor={reponse}>{reponse}</label>
                    </div>
                    )   
                })}
                </div>
            </div>
            <span className="text-red-500 text-xs italic"> {erreurMessage}</span>
            </Modal.Body>
            <Modal.Footer>
                <button className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => validate()}>Valider</button>
                <button className="text-blue-700 hover:text-blue-800 rounded-lg font-bold py-2 px-4 rounded" onClick={() => setOpenModal(false)}>Quitter</button>
            </Modal.Footer>
        </Modal>
    );
}

QuestionAPI.propTypes = {
    openModal : PropTypes.func,
    setOpenModal : PropTypes.func,
  }
export default QuestionAPI;