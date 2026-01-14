// src/dashboard/Dashboard.jsx

import React, { useState } from 'react';
import DonationCard from './DonationCard';
import './Dashboard.css';

// Sample data for demonstration
const dummyDonations = [
  {
    id: 1,
    name: 'Venetian Duck Ragu',
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1594967389146-24d162128795?q=80&w=1770&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Classic Margherita Pizza',
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1780&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Fresh Garden Salad',
    category: 'Salad',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Spicy Chicken Curry',
    category: 'Curry',
    image: 'https://images.unsplash.com/photo-1588166524941-b99616335191?q=80&w=1770&auto=format&fit=crop',
  }
];

const Dashboard = () => {
  const [donations, setDonations] = useState(dummyDonations);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Food Donation Dashboard</h1>
        <button className="add-button">+ Add Donation</button>
      </header>

      <main className="donations-grid">
        {donations.map(donation => (
          <DonationCard key={donation.id} donation={donation} />
        ))}
      </main>
    </div>
  );
};

export default Dashboard;