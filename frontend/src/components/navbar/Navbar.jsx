import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';

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
                    <span onClick={() => changePage('home')} className="text-white text-xl cursor-pointer font-bold">Mon Casino</span>
                    </div>
                    <div className="hidden md:flex justify-end md:flex-grow">
                        <span onClick={() => changePage('home')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Accueil</span>
                        { userConnected?.email ? (
                            <>
                                <span onClick={() => changePage('TODO')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Profil</span>
                                <span onClick={() => changePage('dashboard')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Tableau de bord</span>
                                <span data-cy="deconnexion" onClick={() => changePage('TODO')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Déconnexion</span>
                            </>
                        ) : (
                            <>
                                <span onClick={() => changePage('login')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Connexion</span>
                                <span onClick={() => changePage('register')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Inscription</span>
                            </>
                        )}
                    </div>
                    <div className="block md:hidden">
                        <button onClick={toggleMenu} className="text-gray-300 bg-gray-800 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                                <span onClick={() => changePage('home')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Accueil</span>
                                { userConnected?.email ? (
                                    <>
                                        <span onClick={() => changePage('TODO')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Profil</span>
                                        <span onClick={() => changePage('dashboard')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Profil</span>
                                        <span data-cy="deconnexion" onClick={() => changePage('TODO')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Déconnexion</span>
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