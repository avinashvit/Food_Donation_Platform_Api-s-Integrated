// src/dashboard/DonationCard.jsx

import React from 'react';
import './Dashboard.css'; // Import the shared stylesheet

const DonationCard = ({ donation }) => {
  return (
    <div className="donation-card">
      <div className="card-image-container">
        <img src={donation.image} alt={donation.name} className="donation-image" />
      </div>
      <div className="card-info">
        <h3>{donation.name}</h3>
        <p className="card-category">Category: <span>{donation.category}</span></p>
      </div>
    </div>
  );
};

export default DonationCard;