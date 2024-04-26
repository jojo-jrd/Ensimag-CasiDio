import { useState, useRef, useContext } from 'react';
import { AppContext } from '../../AppContext';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const {changePage } = useContext(AppContext);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
        <header>
            <nav className="bg-black p-4">
                <div className="flex flex-wrap items-center justify-between">
                    <div className="flex-shrink-0">
                        <a href="#" className="text-gold text-xl font-bold">Mon Casino</a>
                    </div>
                    <div className="hidden md:flex justify-end md:flex-grow">
                        <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Accueil</a>
                        <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Jeux</a>
                        <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Promotions</a>
                        <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Aide</a>
                        <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Connexion</a>
                    </div>
                    <div className="block md:hidden">
                        <button onClick={toggleMenu} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                            Menu
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-black rounded-md shadow-lg z-10">
                                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white">Accueil</a>
                                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white">Jeux</a>
                                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white">Promotions</a>
                                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white">Aide</a>
                                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white">Connexion</a>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}
export default NavBar;