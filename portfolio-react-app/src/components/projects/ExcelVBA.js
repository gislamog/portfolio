import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// styles
import '../../styles/ProjectDetails.css';
// images
import ExcelVBALogin from '../../images/projects/excel-vba/excel-vba-login.png';
import ExcelVBA1 from '../../images/projects/excel-vba/excel-vba-1.png';
import ExcelVBA2 from '../../images/projects/excel-vba/excel-vba-2.png';
import ExcelVBA3 from '../../images/projects/excel-vba/excel-vba-3.png';
// image carousel
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';


const ExcelVBA = () => {
    // for Back to Projects button
    const navigate = useNavigate();

    // to scroll to top of this page when user clicks on it in Projects page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="project-detail">
            <div className="section">

                <div className="details-header-wrapper">
                    <button onClick={() => navigate(-1)} className="back-button">Back</button>
                    <div className="section-header">Excel Property Management</div>
                </div>

                <Carousel className="carousel-wrapper">

                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={ExcelVBALogin}
                            alt="Login Page"
                        />
                        <Carousel.Caption>
                            <h3>Login Page</h3>
                        </Carousel.Caption>
                    </Carousel.Item>

                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={ExcelVBA1}
                            alt="Dashboard"
                        />
                        <Carousel.Caption>
                            <h3>Dashboard</h3>
                        </Carousel.Caption>
                    </Carousel.Item>

                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={ExcelVBA2}
                            alt="User Management"
                        />
                        <Carousel.Caption>
                            <h3>User Management</h3>
                        </Carousel.Caption>
                    </Carousel.Item>

                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={ExcelVBA3}
                            alt="Property Details"
                        />
                        <Carousel.Caption>
                            <h3>Property Details</h3>
                        </Carousel.Caption>
                    </Carousel.Item>

                </Carousel>




                <div className="sub-header">Project Description</div>
                <p className="project-description">
                    An Excel and Access database solution for property management. This project involved designing a VBA-driven Excel application to automate property management, reducing human errors and enhancing data privacy.
                </p>
                <p className="project-description">
                    It includes role-based access, allowing only authorized users to modify or view specific data. This project improves efficiency, accuracy, and security in property management processes, setting a foundation for future growth and scalability.
                </p>



                <div className="sub-header">Technologies Used</div>
                <ul className="technologies-used">
                    <li>Microsoft Excel</li>
                    <li>Microsoft Access</li>
                    <li>VBA (Visual Basic for Applications)</li>
                    <li>UML Diagrams</li>
                </ul>



            </div>
        </div>
    );
};

export default ExcelVBA;
