import { Modal } from "flowbite-react";
import { useContext } from "react";
import { useRef } from "react";
import { useState } from "react";
import { AppContext } from "../../AppContext";

function ModalUpdateUser({openModal, setOpenModal, user}) {
    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const emailRef = useRef(null);
    const birthDateRef = useRef(null);
    const addressRef = useRef(null);
    const balanceRef = useRef(null);
    const isAdminRef = useRef(null);
    const passwordRef = useRef(null);
    const { token } = useContext(AppContext);
    const [erreurMessage, setErreurMessage] = useState("");

    function validate() {
        let message = ""
        if (!emailRef.current?.value?.match(/[a-z0-9]{3,10}/)) {
            message += "Le login est incorrect."
        }
        if (!firstNameRef?.current?.value  || 
            !lastNameRef?.current?.value ||
            !emailRef?.current?.value ||
            !birthDateRef?.current?.value) {
            message += "Vous devez remplir le nom, prénom, l'email et la date de naissance."
        }
        setErreurMessage(message);
        if (message.length===0) {
            fetch(`${import.meta.env.VITE_API_URL}/api/user/${user.id}`, 
            {
                method:'PUT',
                headers:{
                    'x-access-token': token,
                    'Content-type':'application/json'
                },
                body: JSON.stringify({
                  firstName : firstNameRef.current.value,
                  lastName : lastNameRef.current.value,
                  email : emailRef.current.value,
                  birthDate : birthDateRef.current.value,
                  password : passwordRef?.current?.value || false,
                  address : addressRef?.current?.value,
                  balance : balanceRef?.current?.value,
                  isAdmin : isAdminRef?.current?.checked
                  
                })
            }).then(res => res.json()).then(reponse => {
              if (reponse.status) {
                setOpenModal(false, true);
              } else {
                setErreurMessage(reponse?.message);
              }
            }).catch(error => {
              console.error(error)
            })
        }

    }
    
    
  
    return (
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Modifier l'utilisateur</Modal.Header>
            <Modal.Body>
            <div className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="firstname">Prénom</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="firstname" ref={firstNameRef} defaultValue={user.firstName} type="text" />
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="lastname">Nom</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="lastname" ref={lastNameRef} defaultValue={user.lastName} type="text" />
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="birthdate">Date de naissance</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="birthdate" ref={birthDateRef} defaultValue={user.birthDate?.slice(0, 10)} type="date" />
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="email" ref={emailRef} type="email" defaultValue={user.email}/>
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="adresse">Adresse</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="adresse" ref={addressRef} type="text" defaultValue={user.adress}/>
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="balance">Solde</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="balance" ref={balanceRef} type="number" defaultValue={user.balance}/>
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="isAdmin">Est Admin</label>
                    <input className="shadow appearance-none border rounded py-2 px-2 focus:outline-none focus:shadow-outline" id="isAdmin" ref={isAdminRef} type="checkbox" defaultChecked={user.isAdmin}/>
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="password">Nouveau mot de passe</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline" id="password" ref={addressRef} type="password"/>                </div>
                <span className="text-red-500 text-xs italic"> {erreurMessage}</span>
            </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => validate()}>Valider</button>
                <button className="text-blue-700 hover:text-blue-800 rounded-lg font-bold py-2 px-4 rounded" onClick={() => setOpenModal(false)}>Annuler</button>
            </Modal.Footer>
        </Modal>
    );
}
export default ModalUpdateUser;