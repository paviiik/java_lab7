import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const TEXT = {
    title: "PhoneCode",
    nav: {
        countries: "Страны",
        prefixes: "Префиксы"
    }
};

const Header = () => {
    const location = useLocation();

    return (
        <div className="header" key={location.pathname}>
            <h1>
                <Link to="/countries" className="nav-link title-link">{TEXT.title}</Link>
            </h1>
            <nav>
                <ul>
                    <li><Link to="/countries" className="nav-link">{TEXT.nav.countries}</Link></li>
                    <li><Link to="/prefixes" className="nav-link">{TEXT.nav.prefixes}</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default Header;
