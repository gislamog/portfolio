import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Projects.css';
import project1 from '../images/projects/healthcare-consulting/frontpage.png';
import project2 from '../images/projects/excel-vba/excel-vba-3.png';

const Projects = ({ setCurrentProject }) => {

    const navigate = useNavigate();

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





            
        </div>
    );
};

export default Projects;
