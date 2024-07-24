import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Skills.css';
import css from '../images/skills/css.png';
import java from '../images/skills/java.png';
import javascript from '../images/skills/javascript.png';
import mongodb from '../images/skills/mongodb.png';
import python from '../images/skills/python.png';
import react from '../images/skills/react.png';
import spring from '../images/skills/spring.png';
import sql from '../images/skills/sql.png';
import coreldraw from '../images/skills/coreldraw.png';
import humanComputerInteractions from '../images/skills/human-computer-interactions.png';
import agileMethodology from '../images/skills/agile methodology.png';
import testing from '../images/skills/testing.png';
import debugging from '../images/skills/debugging.png';
import cpp from '../images/skills/c++.png';
import c from '../images/skills/c.png';
import mobile from '../images/skills/mobile.png';
import uiux from '../images/skills/uiux.png';
import fullstack from '../images/skills/fullstack.png';
import nodejs from '../images/skills/nodejs.png';
import typescript from '../images/skills/typescript.png';
import bootstrap from '../images/skills/bootstrap.png';
import docker from '../images/skills/docker.png';
import git from '../images/skills/git.png';
import github from '../images/skills/github.png';
import aws from '../images/skills/aws.png';
import cognito from '../images/skills/cognito.png';
import restfulapi from '../images/skills/restfulapi.png';
import shellscripting from '../images/skills/shellscripting.png';
import scrum from '../images/skills/scrum.png';
import cybersecurity from '../images/skills/cybersecurity.png';
import vba from '../images/skills/vba.png';
import matlab from '../images/skills/matlab.png';

const skillsData = {
    "Programming Languages": [
        { name: 'Java', logo: java },
        { name: 'JavaScript', logo: javascript },
        { name: 'Python', logo: python },
        { name: 'C++', logo: cpp },
        { name: 'C', logo: c },
        { name: 'CSS', logo: css },
        { name: 'Typescript', logo: typescript },
        { name: 'SQL', logo: sql },
        { name: 'Excel VBA', logo: vba },
        { name: 'MATLAB', logo: matlab },
        
    ],
    "Frameworks & Libraries": [
        { name: 'React', logo: react },
        { name: 'Spring', logo: spring },
        { name: 'Bootstrap', logo: bootstrap },
        { name: 'Node.js', logo: nodejs },
    ],
    "Tools & Platforms": [
        { name: 'MongoDB', logo: mongodb },
        { name: 'Docker', logo: docker },
        { name: 'Git', logo: git },
        { name: 'GitHub', logo: github },
        { name: 'AWS', logo: aws },
        { name: 'Amazon Cognito', logo: cognito },
    ],
    "Development Practices": [
        { name: 'RESTful APIs', logo: restfulapi },
        { name: 'Shell Scripting', logo: shellscripting },
        { name: 'Full Stack', logo: fullstack },
        { name: 'Testing', logo: testing },
        { name: 'Debugging', logo: debugging },
        { name: 'Agile', logo: agileMethodology },
        { name: 'Scrum', logo: scrum },
        { name: 'Mobile App', logo: mobile },
        { name: 'Cybersecurity', logo: cybersecurity },
    ],
    "UI/UX & Design": [
        { name: 'UI/UX', logo: uiux },
        { name: 'CorelDRAW', logo: coreldraw },
        { name: 'Human Computer Interactions', logo: humanComputerInteractions },
    ],
};

const Skills = () => {
    return (
        <div id="skills" className="odd-section">

            <div className="section-header">Skills</div>

            {Object.entries(skillsData).map(([group, skills], index) => (
                <div key={index} className="skill-group">

                    <h2 className="skill-group-header">{group}</h2>

                    <div className="skills-container">

                        {skills.map((skill, idx) => (
                            <motion.div
                                key={idx}
                                className="skill-card"
                                whileHover={{ y: -20 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <img src={skill.logo} alt={`${skill.name} logo`} className="skill-logo" />
                                <div className="skill-name">{skill.name}</div>
                            </motion.div>

                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Skills;
