import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Projects.css';
import project1 from '../images/projects/healthcare-consulting/frontpage.png';
import project2 from '../images/projects/excel-vba/excel-vba-3.png';
import project3 from '../images/projects/my-puzzle-adventure/MyPuzzleAdventure1.png';
import project4 from '../images/projects/sierpinskis-triangle/SierpinskisTriangle.png';
import useScrollToTop from './useScrollToTop';

const Projects = ({ setCurrentProject }) => {

    const navigate = useNavigate();

    useScrollToTop(['/projects']); // Specify the path for Projects page

    return (
        <div className="projects-section" id="projects">

            <div className="section-header">Projects</div>


            <div className="project-and-text">
                <div className="wrapper">
                    <div className="image-wrapper" onClick={() => navigate('/projects/healthcare-web-app')}>
                        <img src={project1} alt="Poster Art" className="project-image" />
                    </div>
                    <div className="header-wrapper">
                        <div className="project-title">Healthcare Consulting Web App</div>
                        <div className="see-project-text">See Project</div>
                    </div>
                </div>

                <div className="project-text">
                    <ul>
                        <li>A comprehensive cloud-based platform tailored to meet the firm's requirements, enabling global access.</li>
                        <li>Utilizes React.js, Spring Boot, MongoDB, and Amazon S3.</li>
                        <li>Simplifies the creation, management, and analysis of data.</li>
                        <div style={{ color: 'grey', marginLeft: '-80px', marginTop: '20px' }}>* Original company name and logo replaced for privacy *</div>
                    </ul>
                </div>
            </div>






            <div className="project-and-text">
                <div className="wrapper">
                    <div className="image-wrapper" onClick={() => navigate('/projects/excel-vba')}>
                        <img src={project2} alt="Poster Art" className="project-image" />
                    </div>
                    <div className="header-wrapper">
                        <div className="project-title">Excel VBA Property Management</div>
                        <div className="see-project-text">See Project</div>
                    </div>
                </div>

                <div className="project-text">
                    <ul>
                        <li>Allows admins and employees to manage rentals, lease initiations and closures, and fees.</li>
                        <li>Generates reports for specific months or years.</li>
                        <li>Schedules late fees automatically when rents were overdue.</li>
                        <li>Microsoft Access for data management.</li>
                    </ul>
                </div>
            </div>




            <div className="project-and-text">
                <div className="wrapper">
                    <div className="image-wrapper" onClick={() => navigate('/projects/my-puzzle-adventure')}>
                        <img src={project3} alt="Poster Art" className="project-image" />
                    </div>
                    <div className="header-wrapper">
                        <div className="project-title" style={{marginTop: '30px'}} >My Puzzle Adventure</div>
                        <div className="see-project-text" style={{ marginTop: '30px' }}>See Project</div>
                    </div>
                </div>

                <div className="project-text">
                    <ul>
                        <li>Personal project developed using Java.</li>
                        <li>2D pixel art graphics.</li>
                        <li>Combines exploration, puzzle-solving, and combat in a labyrinth environment.</li>
                    </ul>
                </div>
            </div>



            <div className="project-and-text">
                <div className="wrapper">
                    <div className="image-wrapper" onClick={() => navigate('/projects/sierpinskis-triangle')}>
                        <img src={project4} alt="Poster Art" className="project-image" />
                    </div>
                    <div className="header-wrapper">
                        <div className="project-title" style={{ marginTop: '30px' }} >Sierpinski's Triangle</div>
                        <div className="see-project-text" style={{ marginTop: '30px' }}>See Project</div>
                    </div>
                </div>

                <div className="project-text">
                    <ul>
                        <li>INTERACTIVE. Click to play!</li>
                        <li>
                            What happens when you make a dot, then keep making new dots halfway to one of the triangle's main points, and repeat infinitely?</li>
                    </ul>
                </div>
            </div>


            
        </div>
    );
};

export default Projects;
