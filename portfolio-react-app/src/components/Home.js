﻿import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BannerImage from '../images/desktop-alone.png';
import GithubIcon from '../images/icons/github-icon.png';
import IndeedIcon from '../images/icons/indeed-icon.png';
import LinkedInIcon from '../images/icons/linkedin-icon.png';
import PaintStreak from './PaintStreak.js'
import '../styles/Home.css';
import { links } from './Links.js';

// Links animation
const linkVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.3, // Stagger animation by 0.3s
            type: 'spring',
            stiffness: 50,
        },
    }),
};

const Home = () => {
    const [inView, setInView] = useState(false);
    const linksContainerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            { threshold: 0.1 } // Adjust as needed
        );

        if (linksContainerRef.current) {
            observer.observe(linksContainerRef.current);
        }

        return () => {
            if (linksContainerRef.current) {
                observer.unobserve(linksContainerRef.current);
            }
        };
    }, []);

    // Links
    const linkIcons = [
        { href: links.github, icon: GithubIcon, text: 'GitHub' },
        { href: links.linkedin, icon: LinkedInIcon, text: 'LinkedIn' },
        { href: links.indeed, icon: IndeedIcon, text: 'Indeed' },
    ];

    return (
        <div id="home" className="home-section">
            <div className="section">
                
                <div className="home-left">
                    <div className="home-text">
                        <h2 className="intro-text">Hi, I am</h2>
                        <h1 className="name">Gülsüm</h1>
                        <h1 className="name">Islamoğlu</h1>
                    </div>

                    <div className="title-text">
                        <p>Software Engineer</p>
                    </div>

                    <div className="links-container" ref={linksContainerRef}>
                        {linkIcons.map((link, index) => (
                            <motion.a
                                key={link.text}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link"
                                custom={index}
                                initial="hidden"
                                animate={inView ? "visible" : "hidden"}
                                variants={linkVariants}
                            >
                                <img src={link.icon} alt={`${link.text} Icon`} className="link-icon" />
                                <span className="hover-text">{link.text}</span>
                            </motion.a>
                        ))}
                    </div>

                    <div className="home-resume">
                        <a href={`${process.env.PUBLIC_URL}/resume.pdf`} target="_blank" rel="noopener noreferrer" className="resume-button">
                            Resume
                        </a>
                    </div>
                </div>

                <div className="home-right">

                    <img src={BannerImage} alt="Flower Desk" className="home-image" />

                    <div className="home-paint-streak">
                        <PaintStreak />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Home;
