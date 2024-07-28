import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// styles
import '../../styles/ProjectDetails.css';
// images
import InnovationPosterboard from '../../images/projects/healthcare-consulting/posterboard.png';
import Frontpage from '../../images/projects/healthcare-consulting/frontpage.png';
import Screenshot3 from '../../images/projects/healthcare-consulting/Screenshot3.png';
import Screenshot4 from '../../images/projects/healthcare-consulting/Screenshot4.png';
import Screenshot5 from '../../images/projects/healthcare-consulting/Screenshot5.png';
// image carousel
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';


const HealthcareWebApp = () => {
    const navigate = useNavigate();

    const images = [
        { src: InnovationPosterboard, description: 'Innovation Posterboard' },
        { src: Frontpage, description: 'Front page' },
        { src: Screenshot3, description: 'Description 3' },
        { src: Screenshot4, description: 'Description 4' },
        { src: Screenshot5, description: 'Description 5' },
    ];

    return (
        <div className="project-detail">
            <button onClick={() => navigate(-1)} className="back-button">Back to Projects</button>
            <div className="section-header">Healthcare Consulting Web App</div>




            <Carousel>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={InnovationPosterboard}
                        alt="First slide"
                    />
                    <Carousel.Caption>
                        <h3>First slide label</h3>
                        <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={InnovationPosterboard}
                        alt="Second slide"
                    />
                    <Carousel.Caption>
                        <h3>Second slide label</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={InnovationPosterboard}
                        alt="Third slide"
                    />
                    <Carousel.Caption>
                        <h3>Third slide label</h3>
                        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>








            <div className="project-subheader">Project Description</div>
            <p className="project-description">
                We developed a healthcare consulting web app to streamline operations for a firm previously relying on Microsoft Word and email. Our solution, created as a senior year Software Engineering project by a team of four, simplifies the creation, management, and analysis of compliance data and facility management.
            </p>
            <p className="project-description">
                The app features secure authentication and authorization, enabling employees to log field audit deficiencies and securely store images. Security was paramount due to sensitive healthcare data.
            </p>
            <p className="project-description">
                Our user-friendly solution empowered non-technical users to enhance their efficiency and organization. Additionally, we automated the compilation of individual reports into a comprehensive final report for administrative review and corrective action.
            </p>

            <div className="sponsor-message">
                <blockquote>
                    "I also wanted to comment on how intelligent this team is and I appreciate your engagement in this process."
                    <br />- Project Sponsor, Owner of Healthcare Consulting Firm
                </blockquote>
            </div>

            <div className="project-subheader">Technologies Used</div>
            <ul className="technologies-used">
                <li>React.js</li>
                <li>Spring</li>
                <li>AWS</li>
                <li>Amazon Cognito</li>
                <li>Auth0</li>
                <li>AXIOS</li>
                <li>MongoDB</li>
                <li>CORS Configurations</li>
                <li>JMeter</li>
                <li>ZAP</li>
            </ul>

            <div className="project-subheader">My Role</div>
            <p className="project-description">
                I worked in a team of four students and became the primary frontend designer and developer.
                I set up the entire initial project infrastructure, including creating and organizing the Spring and React projects.
                Additionally, I contributed to the database schema design and implemented authentication with Auth0, which was later replaced by Amazon Cognito.
            </p>
            <p className="project-description">
                I conducted security, speed, and compliance tests, ensuring we met our standards. I also played a key role in writing regular reports, such as retrospectives, meeting minutes, and plan reviews, and created UML diagrams to facilitate discussions and visualize project requirements.
            </p>
            <p className="project-description">
                I also developed the employee management functionality, allowing the scheduling of employees, preventing double-booking, and allowing vacation
            </p>
            <p className="project-description">
                I also developed the employee management functionality, allowing for the scheduling of employees and preventing double-booking. The system tracked vacations and absences, displaying employee availability when assigning tasks.
            </p>

            <div className="project-subheader">Outcome</div>
            <p className="project-description">
                The project exceeded the firm's functional requirements, achieving 100% regulatory compliance and meeting target response times and performance levels.
            </p>
            <p className="project-description">
                Although we did not deploy the project to a server, our tests validated reliable photo upload functionality and enforced data access based on user roles.
            </p>
            <p className="project-description">
                Recommendations for future improvements include addressing security vulnerabilities, enhancing global accessibility, and regularly reviewing open-source dependencies. Continuous monitoring of performance and security is crucial for maintaining high standards and addressing challenges effectively.
            </p>
        </div>
    );
};

export default HealthcareWebApp;
