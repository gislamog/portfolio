import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Link as ScrollLink, Element, scroller } from 'react-scroll';
// components
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
// projects
import HealthcareWebApp from './components/projects/HealthcareWebApp';
import ExcelVBA from './components/projects/ExcelVBA';
import MyPuzzleAdventure from './components/projects/MyPuzzleAdventure';
import SierpinskisTriangle from './components/projects/SierpinskisTriangle';
import DensityEstimation from './components/projects/DensityEstimation';
// styles
import './styles/App.css';
import './styles/Navbar.css';

function MainPage() {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            scroller.scrollTo(location.state.scrollTo, {
                smooth: true,
                duration: 500,
            });
        }
    }, [location]);

    return (
        <div className="content">
            <Element name="home">
                <Home />
            </Element>
            <Element name="about">
                <About />
            </Element>
            <Element name="skills">
                <Skills />
            </Element>
            <Element name="projects">
                <Projects />
            </Element>
            <Element name="contact">
                <Contact />
            </Element>
        </div>
    );
}

function App() {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/projects/healthcare-web-app" element={<HealthcareWebApp />} />
                    <Route path="/projects/excel-vba" element={<ExcelVBA />} />
                    <Route path="/projects/my-puzzle-adventure" element={<MyPuzzleAdventure />} />
                    <Route path="/projects/sierpinskis-triangle" element={<SierpinskisTriangle />} />
                    <Route path="/projects/density-estimation" element={<DensityEstimation />} />
                </Routes>
            </div>
        </Router>
    );
}


export default App;
