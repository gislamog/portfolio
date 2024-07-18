import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/logo2.png';

const Navbar = () => {
    return (
        <nav className="navbar">

            <div className="navbar-name">
                <Link to="/">
                    <img src={logo} alt="Logo" className="navbar-logo" />
                    Gulsum Islamoglu
                </Link>
            </div>

            <ul className="navbar-links">
                <li><Link to="/" className="left-links">/home</Link></li>
                <li><Link to="/projects" className="left-links">/projects</Link></li>
                <li><Link to="/resume" className="left-links">/resume</Link></li>
                <li><Link to="/contact" className="contact-link">/contact</Link></li>
            </ul>

        </nav>
    );
};

export default Navbar;
