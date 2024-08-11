import React from 'react';
import '../styles/About.css';

const About = () => {
    return (

        <div id="about" className="about-section">
            <div className="section">

            {/* About Me */}
            <div className="section-header">About</div>
            <div className="sub-header">A Little About Me...</div>

            <p className="about-text">Based in Riverside, CA, I am a dedicated software engineer with a
                strong academic background and hands-on project experience. During my studies, I have
                developed a deep understanding of software development and design patterns.</p>

            <p className="about-text">
                My methodical and detail-oriented approach ensures the creation of high-quality, maintainable code.
                I am passionate about continuously learning and adapting to the evolving tech industry,
                eager to leverage my technical skills in challenging projects.</p>

            {/* Education */}
            <div className="education-section">
                <div className="sub-header">Education</div>
                <div className="education-container">

                    {/* Completed */}
                    <div className="education-column">
                        <h3>Completed</h3>

                        <div className="flip-card">
                            <div className="flip-card-inner">
                                <div className="flip-card-front">
                                    <div className="text-degree">Software</div>
                                    <div className="text-degree">Engineering</div>
                                    <div className="text-degree-type">Bachelors of Science</div>
                                    <div className="line-small"></div>
                                    <div className="text-school">Arizona State University</div>
                                </div>

                                <div className="flip-card-back">
                                    <div className="text-year">2021-2024</div>
                                    <div className="text-GPA">GPA: 3.50/4.00 - Cum Laude</div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="line"></div>

                    {/* In-Progress */}
                    <div className="education-column">
                        <h3>In-Progress</h3>

                        <div className="flip-card">
                            <div className="flip-card-inner">
                                <div className="flip-card-front">
                                    <div className="text-degree">Computer</div>
                                    <div className="text-degree">Engineering</div>
                                    <div className="text-degree-type">Masters</div>
                                    <div className="line-small"></div>
                                    <div className="text-school">Arizona State University</div>
                                </div>

                                <div className="flip-card-back">
                                    <div className="text-year">2024-2026</div>
                                    <div className="text-GPA">Focus: Big Data Systems</div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
            </div>
        </div>

    );
};

export default About;
