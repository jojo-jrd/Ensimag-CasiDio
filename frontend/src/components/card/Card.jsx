import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { AppContext } from '../../AppContext';
import { useContext } from 'react';
import PropTypes from 'prop-types';

function Card({ title, description, image, pageClick }) {
    const {changePage } = useContext(AppContext);
    return (
        <div className="w-full md:w-1/3 mt-1.5">
            <div className="card-home ml-1.5 border rounded-lg shadow bg-gray-800 border-gray-700">
                <img className="rounded-t-lg" src={image} alt={title} />
                <div className="p-5">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{title}</h5>
                    <p className="mb-3 font-normal text-gray-400">{description}</p>
                    <button onClick={() => changePage(pageClick)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800">
                        Jouer
                        <FontAwesomeIcon className="ml-3" icon={faArrowRight} />
                    </button>
                </div>
            </div>
        </div>
    )
}

Card.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    image : PropTypes.string,
    pageClick : PropTypes.string
};

export default Card;