import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import logo from '../images/logo2.png';

const Navbar = () => {
    const location = useLocation();
    const isMainPage = location.pathname === '/';
    const [menuOpen, setMenuOpen] = useState(false);

    const scrollToSection = (section) => {
        return (
            <RouterLink to="/" state={{ scrollTo: section }} className="left-links">
                {`/${section}`}
            </RouterLink>
        );
    };

    // hamburger menu for mobile
    const hamburgerClick = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-name">
                {isMainPage ? (
                    <ScrollLink to="home" smooth={true} duration={500}>
                        <img src={logo} alt="Logo" className="navbar-logo" />
                        Gulsum Islamoglu
                    </ScrollLink>
                ) : (
                    <RouterLink to="/">
                        <img src={logo} alt="Logo" className="navbar-logo" />
                        Gulsum Islamoglu
                    </RouterLink>
                )}
            </div>

            <div className="hamburger" onClick={hamburgerClick}>
                ☰
            </div>

            <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <li>
                    {isMainPage ? (
                        <ScrollLink to="about" smooth={true} duration={500} className="left-links">/about</ScrollLink>
                    ) : (
                        scrollToSection('about')
                    )}
                </li>
                <li>
                    {isMainPage ? (
                        <ScrollLink to="skills" smooth={true} duration={500} className="left-links">/skills</ScrollLink>
                    ) : (
                        scrollToSection('skills')
                    )}
                </li>
                <li>
                    {isMainPage ? (
                        <ScrollLink to="projects" smooth={true} duration={500} className="left-links">/projects</ScrollLink>
                    ) : (
                        scrollToSection('projects')
                    )}
                </li>
                <li>
                    {isMainPage ? (
                        <ScrollLink to="contact" smooth={true} duration={500} className="contact-link">/contact</ScrollLink>
                    ) : (
                        <RouterLink to="/" state={{ scrollTo: 'contact' }} className="contact-link">/contact</RouterLink>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
