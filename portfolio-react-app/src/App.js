import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import './styles/App.css';
import './styles/Navbar.css';

function App() {

    return (
        <Router basename={process.env.PUBLIC_URL}>

            <div className="App">

                <div>
                    <Navbar />
                    <div className="content">
                        <Home />
                        <About />
                        <Skills />
                        <Projects />
                        <Contact />
                    </div>
                </div>

            </div>
        </Router>
    );
}

export default App;
