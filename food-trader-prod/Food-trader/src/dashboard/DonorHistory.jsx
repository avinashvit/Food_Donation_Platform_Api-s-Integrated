// src/dashboard/DonorHistory.jsx (FINAL DUAL-RATING CODE)

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow'; 

// ------------------------------------------------------------------
// COMPONENT 1: Star Rating Input/Display (Reusable) - MUST BE INCLUDED
// ------------------------------------------------------------------
const StarRating = ({ initialRating, donationId, onRate, disabled, role }) => {
    const [rating, setRating] = useState(initialRating || 0);

    const handleRatingClick = (newRating) => {
        if (disabled) return;
        setRating(newRating);
        // Donor always rates the recipient here
        onRate(donationId, newRating, 'donor'); 
    };

    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className="star"
                    style={{ cursor: disabled ? 'default' : 'pointer', color: star <= rating ? '#FFD700' : '#ccc' }}
                    onClick={() => handleRatingClick(star)}
                >
                    ★
                </span>
            ))}
            {disabled && <span style={{marginLeft: '10px', color: '#4CAF50'}}>Rated!</span>}
        </div>
    );
};
// ------------------------------------------------------------------


const DonorHistory = () => {
    const { user, isAuthenticated, isLoading } = useAuth0(); 
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [openChatId, setOpenChatId] = useState(null);

    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            setHistoryLoading(false); 
            return;
        }

        const fetchHistory = async () => {
            setHistoryLoading(true); 
            
            try {
                const response = await fetch(`http://localhost:3001/api/donations/donor/${user.sub}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }
                const data = await response.json();
                setDonations(data);
            } catch (error) {
                console.error('Error fetching donation history:', error);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [isAuthenticated, isLoading, user]);

    // --- Rating Submission Logic (Sends PATCH to backend) ---
    const handleRating = async (donationId, ratingValue, role) => {
        try {
            const response = await fetch(`http://localhost:3001/api/ratings/${donationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: ratingValue, role: role }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit rating.');
            }

            // Update local state to show the rating immediately
            setDonations(prevDonations => prevDonations.map(donation => {
                if (donation.id === donationId) {
                    return { ...donation, [`${role}Rating`]: ratingValue };
                }
                return donation;
            }));
            
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        }
    };
    // ----------------------------------------------------


    if (openChatId) {
        return (
            <div className="dashboard-container">
                <button onClick={() => setOpenChatId(null)} className="back-button" style={{marginBottom: '20px'}}>
                    ← Back to History
                </button>
                <ChatWindow donationId={openChatId} participantRole="Donor" />
            </div>
        );
    }

    if (isLoading || historyLoading) {
        return <div className="dashboard-container">Loading history...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>My Donation History</h1>
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </header>
            <main>
                {donations.length === 0 ? (
                    <p>You have not made any donations yet.</p>
                ) : (
                    <div className="history-list">
                        {donations.map(donation => {
                            const isCompleted = donation.status === 'completed';
                            const hasDonorRated = !!donation.donorRating; // Donor rates Recipient
                            
                            return (
                                <div className="history-item" key={donation.id}>
                                    <h3>{donation.foodName}</h3>
                                    <p>Category: {donation.category}</p>
                                    <p>Quantity: {donation.quantity}</p>
                                    <p>Location: {donation.location}</p>
                                    <p>Status: <strong>{donation.status.toUpperCase()}</strong></p>

                                    {isCompleted && (
                                        <div style={{marginTop: '15px', paddingBottom: '5px'}}>
                                            {/* 1. DONOR RATES RECIPIENT (Editable) */}
                                            <p style={{marginBottom: '5px', fontWeight: 'bold'}}>Rate Recipient:</p>
                                            <StarRating 
                                                initialRating={donation.donorRating}
                                                donationId={donation.id}
                                                onRate={handleRating}
                                                disabled={hasDonorRated}
                                                role="donor" // Explicitly pass role
                                            />
                                            
                                            {/* 2. RECIPIENT RATES DONOR (Read-Only Feedback) */}
                                            <p style={{marginTop: '10px', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#666'}}>
                                                Recipient's Rating of You:
                                            </p>
                                            <StarRating 
                                                initialRating={donation.recipientRating}
                                                donationId={donation.id}
                                                onRate={() => {}} // Disabled function
                                                disabled={true} 
                                            />
                                        </div>
                                    )}
                                    
                                    {donation.status.toUpperCase() === 'CLAIMED' && (
                                        <button 
                                            className="chat-button"
                                            onClick={() => setOpenChatId(donation.id)}
                                        >
                                            Chat with Recipient
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DonorHistory;