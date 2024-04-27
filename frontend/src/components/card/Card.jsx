import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { AppContext } from '../../AppContext';
import { useContext } from 'react';

function Card({ title, description, image, pageClick }) {
    const {changePage } = useContext(AppContext);
    return (
        <div className="m-1.5 p-1.5 w-full sm:w-1/3 border rounded-lg shadow bg-gray-800 border-gray-700">
            <img className="rounded-t-lg" src={image} alt={title} />
            <div className="p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 text-white">{title}</h5>
                <p className="mb-3 font-normal text-gray-400">{description}</p>
                <button onClick={() => changePage(pageClick)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800">
                    Play
                    <FontAwesomeIcon className="ml-3" icon={faArrowRight} />
                </button>
            </div>
        </div>
    )
}
export default Card;