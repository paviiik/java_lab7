import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const location = useLocation();

    return (
        <div className="header" key={location.pathname}>
            <h1>
                <Link to="/countries" className="nav-link title-link">PhoneCode</Link>
            </h1>
            <nav>
                <ul>
                    <li><Link to="/countries" className="nav-link">Страны</Link></li>
                    <li><Link to="/prefixes" className="nav-link">Префиксы</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default Header;