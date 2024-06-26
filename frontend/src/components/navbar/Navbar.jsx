import { useState, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons/faCirclePlus';
import Viardot from './../../assets/viardot-coin.png';
import QuestionAPI from './../../components/questionAPI/QuestionAPI';
import LogoCasiDio from './../../assets/logo_casidio.png';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isQuestionsOpen, setQuestionsOpen] = useState(false);
    const {changePage, userConnected} = useContext(AppContext);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    function changeMobilePage(page) {
        setIsOpen(false);
        changePage(page);
    }
    return (
        <header>
            <nav className="bg-gray-800 p-4">
                <div className="flex flex-wrap items-center justify-between">
                    <div className="flex-shrink-0">
                        <span onClick={() => changePage('home')} className="text-white text-xl cursor-pointer font-bold">
                            <img className="w-12" src={LogoCasiDio} alt="Logo CasiDio"/>
                        </span>
                    </div>
                    <div className="hidden md:flex justify-end md:flex-grow">
                        { userConnected?.email ? (
                            <span>
                                <p className={(userConnected.balance > 100 ? 'text-lime-500' : 'text-amber-500') +' inline'}>{userConnected.balance}</p>
                                <img src={Viardot} alt="Viardot Money" className="w-10 ml-1 inline"/>
                                <FontAwesomeIcon className='text-xl text-lime-500 hover:text-lime-300 hover:cursor-pointer' icon={faCirclePlus} onClick={() => setQuestionsOpen(true)}/>
                            </span>
                        ) : <></>}
                        <span data-cy="accueil" onClick={() => changePage('home')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Accueil</span>
                        { userConnected?.email ? (
                            <>
                                { userConnected?.isAdmin ? (
                                    <span data-cy="admin-user" onClick={() => changePage('adminUsers')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Gestion Utilisateur</span>
                                ) : ''}
                                <span data-cy="profil" onClick={() => changePage('profil')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Profil</span>
                                <span data-cy="dashboard" onClick={() => changePage('dashboard')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Tableau de bord</span>
                                <span data-cy="deconnexion" onClick={() => changePage('logout')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Déconnexion</span>
                            </>
                        ) : (
                            <>
                                <span data-cy="connexion" onClick={() => changePage('login')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Connexion</span>
                                <span onClick={() => changePage('register')} className="text-gray-300 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">Inscription</span>
                            </>
                        )}
                    </div>
                    <div className="block md:hidden">
                        { userConnected?.email ? (
                            <span>
                                <p className={(userConnected.balance > 100 ? 'text-lime-500' : 'text-amber-500') +' inline'}>{userConnected.balance}</p>
                                <img src={Viardot} alt="Viardot Money" className="w-10 ml-1 inline"/>
                                <FontAwesomeIcon className='text-xl text-lime-500' icon={faCirclePlus} onClick={() => setQuestionsOpen(true)}/>
                            </span>
                        ) : <></>}
                        <button onClick={toggleMenu} className="text-gray-300 bg-gray-800 hover:text-white px-3 py-2 cursor-pointer rounded-md text-sm font-medium">
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                                <span data-cy="accueil" onClick={() => changeMobilePage('home')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Accueil</span>
                                { userConnected?.email ? (
                                    <>
                                        { userConnected?.isAdmin ? (
                                            <span data-cy="admin-user" onClick={() => changeMobilePage('adminUsers')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Gestion Utilisateur</span>
                                        ) : ''}
                                        <span data-cy="profil" onClick={() => changeMobilePage('profil')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Profil</span>
                                        <span data-cy="dashboard" onClick={() => changeMobilePage('dashboard')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Tableau de bord</span>
                                        <span data-cy="deconnexion" onClick={() => changeMobilePage('logout')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Déconnexion</span>
                                    </>
                                ) : (
                                    <>
                                        <span data-cy="connexion" onClick={() => changeMobilePage('login')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Connexion</span>
                                        <span onClick={() => changeMobilePage('register')} className="block px-4 py-2 cursor-pointer text-gray-300 hover:text-white">Inscription</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
           { isQuestionsOpen && (
                <QuestionAPI setOpenModal={(value) => setQuestionsOpen(value)}/>
           )}

        </header>
    )
}
export default NavBar;