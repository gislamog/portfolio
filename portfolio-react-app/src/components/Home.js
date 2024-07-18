import React from 'react';
import BannerImage from '../images/desktop-flowers.png';


const Home = () => {
    return (
        <div>
            <div className="banner">
                <img src={BannerImage} alt="Banner Image" className="banner-image" />
                <div class="banner-text">
                    <h1>Gulsum Islamoglu</h1>
                    <h2>Software Engineer</h2>
                </div>
            </div>

            <div className="skills-banner">
                <p>
                    <span>Java</span>
                    <span>JavaScript</span>
                    <span>C++</span>
                    <span>Full-Stack Development</span>
                    <span>DB Management</span>
                </p>
            </div>

        </div>
    );
};

export default Home;
