import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import Viardot from './../../assets/viardot-coin.png';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const {changePage, userConnected} = useContext(AppContext);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
        <header>
            <nav className="bg-gray-800 p-4">
                <div className="flex flex-wrap items-center justify-between">
                    <div className="flex-shrink-0">
                        <span onClick={() => changePage('home')} className="text-white text-xl cursor-pointer font-bold">CasiDio</span>
                    </div>
                    <div className="hidden md:flex justify-end md:flex-grow">
                        { userConnected?.email ? (
                            <span>
                                <p className={(userConnected.balance > 100 ? 'text-lime-500' : 'text-amber-500') +' inline'}>{userConnected.balance}</p>
                                <img src={Viardot} alt="Viardot Money" className="w-10 ml-1 inline"/>
                            </span>
                        ) : <></>}
                        <span onClick={() => changePage('home')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Accueil</span>
                        { userConnected?.email ? (
                            <>
                                { userConnected?.isAdmin ? (
                                    <span onClick={() => changePage('adminUsers')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Gestion Utilisateur</span>
                                ) : ''}
                                <span data-cy="profil" onClick={() => changePage('profil')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Profil</span>
                                <span onClick={() => changePage('dashboard')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Tableau de bord</span>
                                <span data-cy="deconnexion" onClick={() => changePage('logout')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Déconnexion</span>
                            </>
                        ) : (
                            <>
                                <span onClick={() => changePage('login')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Connexion</span>
                                <span onClick={() => changePage('register')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Inscription</span>
                            </>
                        )}
                    </div>
                    <div className="block md:hidden">
                        { userConnected?.email ? (
                            <span>
                                <p className={(userConnected.balance > 100 ? 'text-lime-500' : 'text-amber-500') +' inline'}>{userConnected.balance}</p>
                                <img src={Viardot} alt="Viardot Money" className="w-10 ml-1 inline"/>
                            </span>
                        ) : <></>}
                        <button onClick={toggleMenu} className="text-gray-300 bg-gray-800 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                                <span onClick={() => changePage('home')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Accueil</span>
                                { userConnected?.email ? (
                                    <>
                                        { userConnected?.isAdmin ? (
                                            <span onClick={() => changePage('adminUsers')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Gestion Utilisateur</span>
                                        ) : ''}
                                        <span data-cy="profil" onClick={() => changePage('profil')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Profil</span>
                                        <span onClick={() => changePage('dashboard')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Tableau de bord</span>
                                        <span data-cy="deconnexion" onClick={() => changePage('logout')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Déconnexion</span>
                                    </>
                                ) : (
                                    <>
                                        <span onClick={() => changePage('login')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Connexion</span>
                                        <span onClick={() => changePage('register')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Inscription</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}
export default NavBar;