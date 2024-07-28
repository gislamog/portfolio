import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Link as ScrollLink, Element } from 'react-scroll';
// components
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import HealthcareWebApp from './components/projects/HealthcareWebApp';
// styles
import './styles/App.css';
import './styles/Navbar.css';

function App() {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/projects/healthcare-web-app" element={<HealthcareWebApp />} />
                </Routes>
            </div>
        </Router>
    );
}

function MainPage() {

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

export default App;
