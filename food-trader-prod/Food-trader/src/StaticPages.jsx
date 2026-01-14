// src/StaticPages.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; 

// --- About Us Component ---
export const AboutUs = () => {
    return (
        <div className="home-container">
            <video autoPlay loop muted id="bg-video">
                <source src="/videoplayback.mp4" type="video/mp4" />
            </video>
            
            <div className="static-header">
                <Link to="/" className="menu-toggle-btn">← Back to Home</Link>
            </div>
            
            <main className="about-content">
                <div className="content-box">
                    <h1>About Our Platform</h1>
                    <p>
                        The Food Donation Platform is dedicated to combating food waste and alleviating hunger by connecting donors (restaurants, caterers, and individuals) directly with recipients (charities, shelters, and communities).
                    </p>
                    <p>
                        Using modern technology like Auth0 for security, Firebase for real-time chat, and Leaflet for location tracking, we ensure reliable, transparent, and timely logistics for every food donation.
                    </p>
                </div>
            </main>
        </div>
    );
};

// --- Contact Us Component ---
export const ContactUs = () => {
    return (
        <div className="home-container">
            <video autoPlay loop muted id="bg-video">
                <source src="/videoplayback.mp4" type="video/mp4" />
            </video>
            
            <div className="static-header">
                <Link to="/" className="menu-toggle-btn">← Back to Home</Link>
            </div>

            <main className="contact-content">
                <div className="content-box">
                    <h1>Contact & Support</h1>
                    <p>
                        If you have any questions, partnership inquiries, or need support regarding a donation, please reach out to us.
                    </p>
                    <div className="contact-details">
                        <p><strong>Email:</strong> support@fooddonation.app</p>
                        <p><strong>Phone:</strong> +91 9876 543210</p>
                    </div>
                </div>
            </main>
        </div>
    );
};