const Dropdown = ({ submenus, display, changePage }) => {
    return (
        <ul className={display ? 'dropdown show' : 'dropdown hidden'}>
            {submenus.map((submenu, index) => (
                <li key={index} className="menu-items">
                    <button onClick={() => changePage(submenu.page)}>{submenu.name}</button>
                </li>
            ))}
        </ul>
    );
};

export default Dropdown;