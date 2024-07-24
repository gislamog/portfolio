import React from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import logo from '../images/logo2.png';

const Navbar = () => {
    return (

        <nav

            className="navbar">

            <div className="navbar-name">
                <ScrollLink to="home" smooth={true} duration={500}>
                    <img src={logo} alt="Logo" className="navbar-logo" />
                    Gulsum Islamoglu
                </ScrollLink>
            </div>

            <ul className="navbar-links">
                <li>
                    <ScrollLink to="about" smooth={true} duration={500} className="left-links">/about</ScrollLink>
                </li>
                <li>
                    <ScrollLink to="skills" smooth={true} duration={500} className="left-links">/skills</ScrollLink>
                </li>
                <li>
                    <ScrollLink to="projects" smooth={true} duration={500} className="left-links">/projects</ScrollLink>
                </li>
                <li>
                    <ScrollLink to="contact" smooth={true} duration={500} className="contact-link">/contact</ScrollLink>
                </li>
            </ul>

        </nav>
    );
};

export default Navbar;
