// src/ContactUs.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Use Home styles for the background

const ContactUs = () => {
    return (
        <div className="home-container">
            {/* Background Video */}
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

export default ContactUs;