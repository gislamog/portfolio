import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from 'emailjs-com';
import '../styles/Contact.css';
import GithubIcon from '../images/icons/github-icon.png';
import IndeedIcon from '../images/icons/indeed-icon.png';
import LinkedInIcon from '../images/icons/linkedin-icon.png';
import EmailIcon from '../images/icons/email-icon.png';
import LocationIcon from '../images/icons/location-icon.png';
import CopyPaste from '../images/icons/copypaste.png';
import { links } from './Links.js';

// Links animation
const linkVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.3, // Stagger animation by 0.3s
            type: 'spring',
            stiffness: 50,
        },
    }),
};

const Contact = () => {
    const [inView, setInView] = useState(false);
    const contactLinksRef = useRef(null);
    const formRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState({ email: '', location: '' });

    const copyToClipboard = (text, type) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopySuccess({ ...copySuccess, [type]: 'Copied!' });
                setTimeout(() => setCopySuccess({ ...copySuccess, [type]: '' }), 2000);
            }).catch((err) => {
                console.error('Failed to copy: ', err);
            });
        } else {
            // Fallback: Create a temporary input element to copy the text
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopySuccess({ ...copySuccess, [type]: 'Copied!' });
                setTimeout(() => setCopySuccess({ ...copySuccess, [type]: '' }), 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
            document.body.removeChild(textArea);
        }
    };



    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            { threshold: 0.1 } // Adjust as needed
        );

        if (contactLinksRef.current) {
            observer.observe(contactLinksRef.current);
        }

        return () => {
            if (contactLinksRef.current) {
                observer.unobserve(contactLinksRef.current);
            }
        };
    }, []);

    // Links
    const linkIcons = [
        { href: links.github, icon: GithubIcon, text: 'GitHub' },
        { href: links.linkedin, icon: LinkedInIcon, text: 'LinkedIn' },
        { href: links.indeed, icon: IndeedIcon, text: 'Indeed' },
        { href: links.email, icon: EmailIcon, text: 'Email' },
        { href: links.location, icon: LocationIcon, text: 'Location' },
    ];

    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm('service_hdez0y9', 'template_fb6rq4n', e.target, 'A_R-4-5HMhZgFbB1D')
            .then((result) => {
                console.log(result.text);
                alert('Message sent successfully!');
                formRef.current.reset();    // clear form 
            }, (error) => {
                console.log(error.text);
                alert('Failed to send message. Please try again later.');
            });
    };

    return (
        <div id="contact" className="contact-section">
            <div className="">

                <div className="contact-minus-footer">
                    <div className="section-header">Contact</div>
                    <div className="contact-container">
                        <div className="contact-form-container">

                            <div className="sub-header">Get in Touch</div>


                            <form ref={formRef} onSubmit={sendEmail}>
                                <label htmlFor="name">
                                    Name:
                                    <span className="required"> *</span>
                                </label>
                                <input type="text" id="name" name="from_name" required />

                                <label htmlFor="email">
                                    Email:
                                    <span className="required"> *</span>
                                </label>
                                <input type="email" id="email" name="reply_to" required />

                                <label htmlFor="message">
                                    Message:
                                    <span className="required"> *</span>
                                </label>
                                <textarea id="message" name="message" required />

                                <button type="submit">Send</button>
                            </form>


                        </div>

                        <div className="contact-info-container">
                            <div className="sub-header">Contact Information</div>

                            <div className="contact-copy-container">
                                <p>gulsumi147@gmail.com</p>
                                <img src={CopyPaste} alt="Copy" className="copy-paste-icon"
                                    onClick={() => copyToClipboard('gulsumi147@gmail.com', 'email')} />
                                {copySuccess.email && <span className="copy-success">{copySuccess.email}</span>}
                            </div>

                            <div className="contact-copy-container">
                                <p>Riverside, California, USA</p>
                                <img src={CopyPaste} alt="Copy" className="copy-paste-icon"
                                    onClick={() => copyToClipboard('Riverside, California, USA', 'location')} />
                                {copySuccess.location && <span className="copy-success">{copySuccess.location}</span>}
                            </div>

                            <div className="contact-links" ref={contactLinksRef}>
                                {linkIcons.map((link, index) => (
                                    <motion.a
                                        key={link.text}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link"
                                        custom={index}
                                        initial="hidden"
                                        animate={inView ? "visible" : "hidden"}
                                        variants={linkVariants}
                                    >
                                        <img src={link.icon} alt={`${link.text} Icon`} className="link-icon" />
                                        <span className="hover-text">{link.text}</span>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="footer">
                    <div className="footer-left">
                    </div>
                    <div className="footer-middle">
                        <a href="#home">Home</a>|
                        <a href="#about">About</a>|
                        <a href="#skills">Skills</a>|
                        <a href="#projects">Projects</a>
                    </div>
                    <div className="footer-right"></div>
                </footer>
            </div>
        </div>
    );
};

export default Contact;
