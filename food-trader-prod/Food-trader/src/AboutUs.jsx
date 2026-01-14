// src/AboutUs.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Use Home styles for the background

const AboutUs = () => {
    return (
        <div className="home-container">
            {/* Background Video */}
            <video autoPlay loop muted id="bg-video">
                <source src="/videoplayback.mp4" type="video/mp4" />
            </video>
            
            <div className="static-header">
                <Link to="/" className="menu-toggle-btn">← Back to Home</Link>
            </div>
            
            <main className="about-content">
                {/* This is the main liquid glass box */}
                <div className="content-box">
                    <h1>Meet the Team</h1>
                    
                    {/* New container for the 3-column layout */}
                    <div className="team-container">
                        
                        {/* Team Member 1 */}
                        <div className="team-member">
                            <img src="https://via.placeholder.com/150" alt="Team Member 1" />
                            <h4>Avinash (Lead Developer)</h4>
                            <p>Lead developer and system architect, passionate about building scalable solutions with React and Firebase.</p>
                        </div>

                        {/* Team Member 2 */}
                        <div className="team-member">
                            <img src="https://via.placeholder.com/150" alt="Team Member 2" />
                            <h4>Team Member 2</h4>
                            <p>Manages the server logic, database integration, and all third-party APIs like Google and Auth0.</p>
                        </div>

                        {/* Team Member 3 */}
                        <div className="team-member">
                            <img src="https://via.placeholder.com/150" alt="Team Member 3" />
                            <h4>Team Member 3</h4>
                            <p>Responsible for the modern, glassy look and feel, and ensuring the application is easy to use.</p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AboutUs;