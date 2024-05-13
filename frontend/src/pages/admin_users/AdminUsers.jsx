import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import moment from 'moment';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons/faPenToSquare';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons/faTrashCan';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons/faCaretUp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import swal from 'sweetalert';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ModalUpdateUser from './ModalUpdateUser';

function DisplaySort({currentSort, column}) {
    return (
        <>
            {column == currentSort.column ? (
                currentSort.order == 'ASC' ? 
                    <FontAwesomeIcon className="ml-3" icon={faCaretDown}/>
                : 
                    <FontAwesomeIcon className="ml-3" icon={faCaretUp}/>
            ) : ''}
        </>
    )
}


function AdminUsers() {
    const { token } = useContext(AppContext);
    const [currentSort, setCurrentSort] = useState({
        column : '',
        order : 'ASC',
    });
    const [openUpdateUser, setOpenUpdateUser] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({});

    const [users, setUsers] = useState([]);

    async function loadUsers() {
        const reponse = await (await fetch(`${import.meta.env.VITE_API_URL}/api/users `, {
            method: 'GET',
            headers: {
                'x-access-token': token,
            }
        })).json();
        if (reponse?.['data']) {
            setUsers(reponse['data']);
        } else {
            console.error(reponse.message);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);


    

    // TODO: faire update et tester la suppression quand le bug sera résolu


    function sortColumn(key, type) {
        let order = currentSort.order;
        // Si on avait déjà un tri sur cette colonne, on la tri dans l'autre sens
        if (key == currentSort.column) {
            order = order == 'DESC' ? 'ASC' : 'DESC';
        } else {
            order = 'ASC';
        }
        const newUsers = [...users];
        const functionSort = (a, b) => {
            if (type == 'string') {
                const value = a[key]?.toString()?.localeCompare(b[key]?.toString())
                return order == 'ASC' ? value : 0 - value;
            } else { // date
                let date1 = new Date(a[key]).getTime();
                let date2 = new Date(b[key]).getTime();
                let value = 0;
                if (date1 < date2) {
                    value = -1;
                } else if (date1 > date2) {
                    value = 1
                }
                return order == 'ASC' ? value : 0 - value;
            }
        }
        newUsers.sort(functionSort);
        setCurrentSort({
            column : key,
            order
        });
        setUsers(newUsers);
    }

    // Open the modal for update a user
    function updateUser(user) {
        setUpdatedUser(user);
        setOpenUpdateUser(true);
    }

    // Function callback when a user is updated
    function saveUser(isClose, toastSucces = false) {
        setOpenUpdateUser(isClose);
        if (toastSucces) {
            toast.success("Utilisateur modifié", {
                position: "top-right",
                theme: "colored",
            });
            loadUsers();
        }
    }

    // Delete a specific user
    function deleteUser(user) {
        swal({
            title: "Attention",
            text: `Êtes-vous sûr de supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then(async (willDelete) => {
            if (willDelete) {
                // Suppression de l'utilisateur
                const reponse = await(await fetch(`${import.meta.env.VITE_API_URL}/api/user/${user.id}`, {
                    method: 'DELETE',
                    headers: {
                        'x-access-token': token,
                    },
                })).json();
                if (reponse.status) {
                    toast.success("Utilisateur supprimé", {
                        position: "top-right",
                        theme: "colored",
                      });
                    loadUsers();
                } else {
                    console.error(reponse);
                }

            }
          });
          
    }

    return (
        <>
            <div>
                <table className="w-full mt-4 text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => sortColumn('firstName', 'string')}>
                                Prenom
                                <DisplaySort column='firstName' currentSort={currentSort}/>
                            </th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => sortColumn('lastName', 'string')}>
                                Nom
                                <DisplaySort column='lastName' currentSort={currentSort}/>
                            </th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => sortColumn('email', 'string')}>
                                Email
                                <DisplaySort column='email' currentSort={currentSort}/>
                            </th>
                            <th className="px-6 py-3 cursor-pointer hidden md:table-cell" onClick={() => sortColumn('address', 'string')}>
                                Adresse
                                <DisplaySort column='address' currentSort={currentSort}/>
                            </th>
                            <th className="px-6 py-3 cursor-pointer hidden md:table-cell" onClick={() => sortColumn('isAdmin', 'string')}>
                                Est Admin
                                <DisplaySort column='isAdmin' currentSort={currentSort}/>
                            </th>
                            <th className="px-6 py-3 cursor-pointer hidden md:table-cell" onClick={() => sortColumn('birthDate', 'date')}>
                                Date de naissance
                                <DisplaySort column='birthDate' currentSort={currentSort}/>
                            </th>
                            <th className="px-6 py-3"></th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            return (
                                <tr key={user.id} className="odd:bg-white even:bg-gray-50 border-b">
                                    <td className="px-6 py-3">{user.firstName}</td>
                                    <td className="px-6 py-3">{user.lastName}</td>
                                    <td className="px-6 py-3">{user.email}</td>
                                    <td className="px-6 py-3 hidden md:table-cell">{user.address}</td>
                                    <td className="px-6 py-3 hidden md:table-cell">{user.isAdmin ? 'Oui' : 'Non'}</td>
                                    <td className="px-6 py-3 hidden md:table-cell">{moment(user.birthDate).format('L')}</td>
                                    <td className="px-6 py-3 cursor-pointer" onClick={() => updateUser(user)}><FontAwesomeIcon className="ml-3 text-blue-700" icon={faPenToSquare} /></td>
                                    <td className="px-6 py-3 cursor-pointer" onClick={() => deleteUser(user)}><FontAwesomeIcon className="ml-3 text-red-500" icon={faTrashCan}/></td>
                                </tr>
                            )
                        })

                        }
                    </tbody>
                </table>
            </div>
            <ToastContainer />
            <ModalUpdateUser openModal={openUpdateUser} user={updatedUser} setOpenModal={saveUser}/> 
        </>
    )
}

export default AdminUsers