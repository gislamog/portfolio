import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// styles
import '../../styles/ProjectDetails.css';
// images
import Density2 from '../../images/projects/density-estimation/density-2.png';
// image carousel
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';


const DensityEstimation = () => {
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
                    <div className="section-header">Density Estimation and Classification</div>
                </div>

                <img
                    src={Density2}
                    alt="Density Estimation Visualization" 
                    className="project-details-image"
                />


                <div className="sub-header">Project Description</div>
                <p className="project-description">
                    This project focused on implementing a density estimation and classification system using Python and machine learning techniques. The primary goal was to classify handwritten digits ('0' and '1') based on extracted features like average brightness and brightness standard deviation.
                </p>
                <p className="project-description">
                    I utilized the Naive Bayes classifier, assuming feature independence, and computed probabilities for each class. Through detailed analysis and feature extraction, I achieved a strong understanding of how statistical learning models function in real-world scenarios.
                </p>



                <div className="sub-header">Technologies Used</div>
                <ul className="technologies-used">
                    <li>Python</li>
                    <li>Jupyter Notebook</li>
                    <li>NumPy</li>
                    <li>SciPy</li>
                    <li>Matplotlib</li>
                </ul>

                <div className="sub-header">Outcome</div>
                <p className="project-description">
                    Successfully implemented a Naive Bayes classifier that achieved over 91% accuracy in classifying handwritten digits. This project deepened my knowledge of AI, particularly in probabilistic modeling and supervised learning. 
                </p>
                <p className="project-description">
                    I learned to handle complex datasets, extract meaningful features, and apply statistical models for classification tasks. Additionally, I gained practical experience in improving model accuracy through feature engineering and performance analysis, advancing my skills in machine learning and AI-driven solutions.
                </p>



            </div>
        </div>
    );
};

export default DensityEstimation;
