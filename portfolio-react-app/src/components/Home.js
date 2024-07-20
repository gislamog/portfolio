import React from 'react';
import { motion } from 'framer-motion';
import BannerImage from '../images/desktop-alone.png';
import GithubIcon from '../images/github-icon.png';
import IndeedIcon from '../images/indeed-icon.png';
import LinkedInIcon from '../images/linkedin-icon.png';
import PaintStreak from './PaintStreak.js'
import '../styles/Home.css';

// Links animation
const linkVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.3, // Stagger animation by 0.3s
            type: 'spring',
            stiffness: 50,
        },
    }),
};

const Home = () => {

    // Links
    const links = [
        { href: 'https://github.com/gislamog', icon: GithubIcon, text: 'GitHub' },
        { href: 'https://profile.indeed.com/?hl=en_US&co=US&from=gnav-jobsearch--indeedmobile', icon: IndeedIcon, text: 'Indeed' },
        { href: 'https://www.linkedin.com/in/gulsum-islamoglu/', icon: LinkedInIcon, text: 'LinkedIn' },
    ];

    return (

        <div className="home">

            <div className="home-paint-streak">
                <PaintStreak />
            </div>

            <div className="home-left">

                <motion.div
                    initial={{ x: '-5vh', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, type: 'spring', stiffness: 50 }}
                    className="home-text">

                    <h2 className="intro-text">Hi, I am</h2>
                    <h1 className="name">Gülsüm</h1>
                    <h1 className="name">Islamoğlu</h1>
                </motion.div>

                <div className="links-container">
                    {links.map((link, index) => (
                        <motion.a
                            key={link.text}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={linkVariants}
                        >
                            <img src={link.icon} alt={`${link.text} Icon`} className="link-icon" />
                            <span className="hover-text">{link.text}</span>
                        </motion.a>
                    ))}
                </div>

                <motion.div
                    initial={{ x: '-5vh', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, type: 'spring', stiffness: 50 }}
                    className="home-animation">
                    <p>Software Engineer</p>
                </motion.div>

                <div className="home-resume">
                    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-button">
                        Resume
                    </a>
                </div>

            </div>


            <motion.div
                initial={{ y: 0, opacity: 1, scale: 1.1 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 2, type: 'spring', stiffness: 50 }}
                className="home-right">
                <img src={BannerImage} alt="Flower Desk" className="home-image" />
            </motion.div>


        </div>
    );
};

export default Home;
