import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Projects.css';
import project1 from '../images/projects/healthcare-consulting/frontpage.png';
import project2 from '../images/projects/excel-vba/excel-vba-3.png';
import project3 from '../images/projects/my-puzzle-adventure/MyPuzzleAdventure1.png';
import project4 from '../images/projects/sierpinskis-triangle/SierpinskisTriangle.png';
import project5 from '../images/projects/density-estimation/density-2.png';
import useScrollToTop from './useScrollToTop';

const Projects = ({ setCurrentProject }) => {

    const navigate = useNavigate();

    useScrollToTop(['/projects']); // Specify the path for Projects page

    return (
        <div className="projects-section" id="projects">
            <div className="section">

                <div className="section-header">Projects</div>


                <div className="project-and-text">
                    <div className="wrapper" onClick={() => navigate('/projects/healthcare-web-app')}>

                        <div className="header-wrapper">
                            <div className="project-title">Healthcare Consulting Web App</div>
                            <div className="see-project-text">See Project</div>
                        </div>

                        <div className="image-wrapper" >
                            <img src={project1} alt="Poster Art" className="project-image" />
                        </div>
                        
                    </div>

                    <div className="project-text">
                        <ul>
                            <li>A comprehensive cloud-based platform tailored to meet the firm's requirements, enabling global access.</li>
                            <li>Utilizes React.js, Spring Boot, MongoDB, and Amazon S3.</li>
                            <li>Simplifies the creation, management, and analysis of data.</li>
                            <li>Original company name and logo replaced for privacy.</li>
                        </ul>
                    </div>
                </div>



                <div className="project-and-text">
                    <div className="wrapper" onClick={() => navigate('/projects/density-estimation')}>

                        <div className="header-wrapper">
                            <div className="project-title">Density Estimation and Classification</div>
                            <div className="see-project-text">See Project</div>
                        </div>

                        <div className="image-wrapper" >
                            <img src={project5} alt="Poster Art" className="project-image" />
                        </div>

                    </div>

                    <div className="project-text">
                        <ul>
                            <li>Analyzed handwritten digits '0' and '1' to extract average brightness and brightness standard deviation.</li>
                            <li>Trained a Naive Bayes classifier using these features for image classification.</li>
                            <li>Evaluated classifier accuracy with test images, achieving 91.63% for '0' and 92.33% for '1'.</li>
                            <li>Suggested adding a third feature (white line crossings) to improve accuracy.</li>
                        </ul>
                    </div>
                </div>




                <div className="project-and-text">
                    <div className="wrapper" onClick={() => navigate('/projects/excel-vba')}>

                        <div className="header-wrapper">
                            <div className="project-title">Excel VBA Property Management</div>
                            <div className="see-project-text">See Project</div>
                        </div>

                        <div className="image-wrapper">
                            <img src={project2} alt="Poster Art" className="project-image" />
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
                    <div className="wrapper" onClick={() => navigate('/projects/my-puzzle-adventure')}>

                        <div className="header-wrapper">
                            <div className="project-title" style={{ marginTop: '30px' }} >My Puzzle Adventure</div>
                            <div className="see-project-text" style={{ marginTop: '30px' }}>See Project</div>
                        </div>

                        <div className="image-wrapper">
                            <img src={project3} alt="Poster Art" className="project-image" />
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
                    <div className="wrapper" onClick={() => navigate('/projects/sierpinskis-triangle')}>

                        <div className="header-wrapper">
                            <div className="project-title" style={{ marginTop: '30px' }} >Sierpinski's Triangle</div>
                            <div className="see-project-text" style={{ marginTop: '30px' }}>See Project</div>
                        </div>

                        <div className="image-wrapper">
                            <img src={project4} alt="Poster Art" className="project-image" />
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
        </div>
    );
};

export default Projects;
