import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { toast, ToastContainer } from 'react-toastify';
import Viardot from './../../assets/viardot-coin.png';
import swal from 'sweetalert';

function ProfilView(){
	const firstNameRef = useRef(null);
	const lastNameRef = useRef(null);
	const emailRef = useRef(null);
	const birthDateRef = useRef(null);
	const addressRef = useRef(null);
	const [erreurMessage, setErreurMessage] = useState("");
	const [isEdit, setIsEdit] = useState(false);
	const {changePage, userConnected, token, updateUserConnected} = useContext(AppContext)

	function deleteUser() {
		swal({
            title: "Attention",
            text: `Êtes-vous sûr de supprimer votre compte ? Vous ne pourrez pas l'annuler.`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then(async (willDelete) => {
            if (willDelete) {
                // Suppression de l'utilisateur
                const reponse = await(await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
                    method: 'DELETE',
                    headers: {
                        'x-access-token': token,
                    },
                })).json();
                if (reponse.status) {
                    changePage('logout');
                } else {
                    console.error(reponse);
                }

            }
          });
	}

	async function updateUser(){
		let message = '';
		if (!firstNameRef?.current?.value  || 
			!lastNameRef?.current?.value ||
			!emailRef?.current?.value ||
			!birthDateRef?.current?.value ||
			!addressRef?.current?.value) {
			message += "Vous devez remplir tous les champs."
		}
		setErreurMessage(message)
		if (message.length === 0) {
			fetch(`${import.meta.env.VITE_API_URL}/api/user`, 
				{
					method:'PUT',
					headers:{
						'Content-type':'application/json',
						'x-access-token': token,
					},
					body: JSON.stringify({
					firstName : firstNameRef?.current?.value,
					lastName : lastNameRef?.current?.value,
					email : emailRef?.current?.value,
					birthDate : birthDateRef?.current?.value,
					address : addressRef?.current?.value
					})
				}).then(res => res.json()).then(reponse => {
				if (reponse.status) {
					toast.success("Modifications sauvegardées", {
						position: "top-right",
						theme: "colored",
					});
					setIsEdit(false);
					updateUserConnected();
				} else {
					setErreurMessage(reponse?.message);
				}
				}).catch(error => {
				console.error(error)
			})
		}
	}
	return (
		<div>
			<div className="p-4">
				<div className="flex justify-between">
					<div>

						{ isEdit ?
							<>
								<button className="bg-red-700 hover:bg-red-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4" onClick={() => setIsEdit(false)}>Annuler</button>
								<button className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => updateUser()}>Sauvegarder</button>
							</>
						:
							<button className="bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => setIsEdit(true)}>Modifier</button>
						}
					</div>
					<button className="rounded-lg text-red-500 bg-transparent hover:text-red-600 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => deleteUser()}>
						Supprimer le compte
					</button>

				</div>
				<div className="flex items-center justify-center w-full mt-4">
					<div className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
						<div className="mb-4">
							<h2 className="text-2xl font-bold tracking-tight text-white">Informations personnelles</h2>
						</div>
						<div className="mb-4">
							<label className="block text-white text-sm font-bold mb-2" htmlFor="firstname">Prénom</label>
							<input className={'shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ' + (isEdit ? 'text-black' : 'text-gray-400')} defaultValue={userConnected.firstName} disabled={!isEdit} id="firstname" ref={firstNameRef} type="text" />
						</div>
						<div className="mb-4">
							<label className="block text-white text-sm font-bold mb-2" htmlFor="lastname">Nom</label>
							<input className={'shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ' + (isEdit ? 'text-black' : 'text-gray-400')} id="lastname" defaultValue={userConnected.lastName} disabled={!isEdit} ref={lastNameRef} type="text" />
						</div>
						<div className="mb-4">
							<label className="block text-white text-sm font-bold mb-2" htmlFor="birthdate">Date de naissance</label>
							<input className={'shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ' + (isEdit ? 'text-black' : 'text-gray-400')} id="birthdate" defaultValue={userConnected.birthDate?.slice(0, 10)} disabled={!isEdit} ref={birthDateRef} type="date" />
						</div>
						<div className="mb-4">
							<label className="block text-white text-sm font-bold mb-2" htmlFor="address">Adresse</label>
							<input className={'shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ' + (isEdit ? 'text-black' : 'text-gray-400')} id="address" defaultValue={userConnected.address} disabled={!isEdit} ref={addressRef} type="text" />
						</div>
						<div className="mb-4">
							<label className="block text-white text-sm font-bold mb-2" htmlFor="email">Email</label>
							<input className={'shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ' + (isEdit ? 'text-black' : 'text-gray-400')} id="email" defaultValue={userConnected.email} disabled={!isEdit} ref={emailRef} type="email" />
						</div>
						<span className="text-red-500 text-xs italic"> {erreurMessage}</span>
					</div>
				</div>
			</div>
			<ToastContainer/>
		</div>
	)
}

export default ProfilView