import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import moment from 'moment';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons/faPenToSquare';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons/faTrashCan';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


function AdminUsers() {
    const { token } = useContext(AppContext);
    const [users, setUsers] = useState([]);

    useEffect(() => {
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
        loadUsers();
    }, [])

    function sortColumn(key, type) {
        const newUsers = [...users];
        newUsers.sort((a, b) => {
            if (type == 'string') {
                return a[key]?.localeCompare(b[key]);
            } else { // date
                let date1 = new Date(a[key]).getTime();
                let date2 = new Date(b[key]).getTime();

                if (date1 < date2) {
                    return -1;
                } else if (date1 > date2) {
                    return 1
                } else {
                    return 0;
                }
            }
        });
        setUsers(newUsers);
    }

    return (
        <div>
            <table className="w-full mt-4 text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-800 uppercase bg-gray-200">
                    <tr>
                        {/* TODO: affichage du sort */}
                        <th className="px-6 py-3" onClick={() => sortColumn('firstName', 'string')}>Prenom</th>
                        <th className="px-6 py-3" onClick={() => sortColumn('lastName', 'string')}>Nom</th>
                        <th className="px-6 py-3" onClick={() => sortColumn('email', 'string')}>Email</th>
                        <th className="px-6 py-3" onClick={() => sortColumn('address', 'string')}>Adresse</th>
                        <th className="px-6 py-3" onClick={() => sortColumn('birthDate', 'date')}>Date de naissance</th>
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
                                <td className="px-6 py-3">{user.address}</td>
                                <td className="px-6 py-3">{moment(user.birthDate).format('L')}</td>
                                <td className="px-6 py-3"><FontAwesomeIcon className="ml-3 text-blue-700 cursor-pointer" icon={faPenToSquare} /></td>
                                <td className="px-6 py-3"><FontAwesomeIcon className="ml-3 text-red-500 cursor-pointer" icon={faTrashCan} /></td>
                            </tr>
                        )
                    })

                    }
                </tbody>

            </table>
        </div>
    )
}

export default AdminUsers