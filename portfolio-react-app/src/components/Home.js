import React from 'react';
import BannerImage from '../images/desktop-alone.png';
import GithubIcon from '../images/github-icon.png';
import IndeedIcon from '../images/indeed-icon.png';
import LinkedInIcon from '../images/linkedin-icon.png';
import '../styles/Home.css';

const Home = () => {
    return (

        <div className="home">

            <div className="home-left">

                <div className="home-text">
                    <h2 className="intro-text">Hi, I am</h2>
                    <h1 className="name">Gülsüm</h1>
                    <h1 className="name">Islamoğlu</h1>
                </div>

                <div className="links">
                    <a href="https://github.com/gislamog" target="_blank" rel="noopener noreferrer" className="link">
                        <img src={GithubIcon} alt="Github Icon" className="link-icons" />
                        <span className="hover-text">GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/gulsum-islamoglu/" target="_blank" rel="noopener noreferrer" className="link">
                        <img src={IndeedIcon} alt="Indeed Icon" className="link-icons" />
                        <span className="hover-text">Indeed</span>
                    </a>
                    <a href="https://profile.indeed.com/?hl=en_US&co=US&from=gnav-jobsearch--indeedmobile" target="_blank" rel="noopener noreferrer" className="link">
                        <img src={LinkedInIcon} alt="LinkedIn Icon" className="link-icons" />
                        <span className="hover-text">LinkedIn</span>
                    </a>
                </div>

                <div className="home-animation">
                    <p>Sofware Engineer</p>
                </div>

                <div className="home-resume">
                    <a href="../images/resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-button">
                        Resume
                    </a>
                </div>

            </div>


            <div className="home-right">
                <img src={BannerImage} alt="Flower Desk" className="home-image" />
            </div>


        </div>
    );
};

export default Home;
