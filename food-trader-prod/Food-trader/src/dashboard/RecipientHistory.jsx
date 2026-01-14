// src/dashboard/RecipientHistory.jsx (FINAL DUAL-RATING CODE)

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow'; 

// ------------------------------------------------------------------
// COMPONENT 1: Star Rating Input/Display (Reusable) - DEFINED HERE
// ------------------------------------------------------------------
const StarRating = ({ initialRating, donationId, onRate, disabled }) => {
    const [rating, setRating] = useState(initialRating || 0);

    const handleRatingClick = (newRating) => {
        if (disabled) return;
        setRating(newRating);
        // Recipient always rates the donor here
        onRate(donationId, newRating, 'recipient'); 
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


// ------------------------------------------------------------------
// COMPONENT 2: Recipient History Dashboard
// ------------------------------------------------------------------

const RecipientHistory = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [openChatId, setOpenChatId] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            setHistoryLoading(false);
            return;
        }

        const fetchHistory = async () => {
            setHistoryLoading(true);

            try {
                if (!user.sub) {
                    setHistoryLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:3001/api/orders/recipient/${user.sub}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching order history:', error);
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
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.donationId === donationId) {
                    return { ...order, [`${role}Rating`]: ratingValue };
                }
                return order;
            }));
            
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        }
    };

    // --- Status Update Logic (Mark as Picked Up) ---
    const markAsPickedUp = async (donationId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/donations/status/${donationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Update the local state to change the status immediately
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.donationId === donationId) {
                    return { ...order, status: 'completed' }; 
                }
                return order;
            }));
            
            alert('Donation successfully marked as picked up! You can now rate the experience.');

        } catch (error) {
            console.error('Error marking pickup:', error);
            alert('Error marking pickup. Please try again.');
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString();
    };


    if (openChatId) {
        return (
            <div className="dashboard-container">
                <button onClick={() => setOpenChatId(null)} className="back-button" style={{marginBottom: '20px'}}>
                    ← Back to History
                </button>
                <ChatWindow donationId={openChatId} participantRole="Recipient" /> 
            </div>
        );
    }

    if (isLoading || historyLoading) {
        return <div className="dashboard-container">Loading history...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>My Order History</h1>
                <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </header>
            <main>
                {orders.length === 0 ? (
                    <p>You have not ordered any items yet.</p>
                ) : (
                    <div className="history-list">
                        {orders.map((order, index) => {
                            const isCompleted = order.status === 'completed';
                            // Check if rating exists (Firebase sends 0 if field is absent, so use > 0 or specific check if 0 is a valid rating)
                            const hasRecipientRated = order.recipientRating > 0; 
                            const donorRatingOfRecipient = order.donorRating > 0;
                            
                            return (
                                <div className="history-item" key={index}>
                                    <h3>Order #{index + 1}</h3>
                                    <p>Food Name: <strong>{order.foodName}</strong></p>
                                    <p>Category: <span>{order.category}</span></p>
                                    <p>Quantity: <span>{order.quantity}</span></p>
                                    <p>Timestamp: {formatTimestamp(order.timestamp)}</p>
                                    
                                    {/* Status Display */}
                                    <p>Status: <strong style={{color: isCompleted ? '#4CAF50' : '#FF9800'}}>{(order.status || 'claimed').toUpperCase()}</strong></p>
                                    
                                    {/* 👇 RATING LOGIC */}
                                    {isCompleted ? (
                                        <div style={{marginTop: '15px', paddingBottom: '5px'}}>
                                            {/* 1. RECIPIENT RATES DONOR (Editable) */}
                                            <p style={{marginBottom: '5px', fontWeight: 'bold'}}>Rate Donor:</p>
                                            <StarRating 
                                                initialRating={order.recipientRating}
                                                donationId={order.donationId}
                                                onRate={handleRating}
                                                disabled={hasRecipientRated} 
                                            />
                                            
                                            {/* 2. DONOR RATES RECIPIENT (Read-Only Feedback) */}
                                            <p style={{marginTop: '10px', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#666'}}>
                                                Donor's Rating of You:
                                            </p>
                                            <StarRating 
                                                initialRating={order.donorRating}
                                                donationId={order.donationId}
                                                onRate={() => {}} // Disabled function
                                                disabled={true} 
                                            />
                                        </div>
                                    ) : (
                                        /* Show Mark as Picked Up button only if NOT completed */
                                        <button
                                            className="pickup-button"
                                            onClick={() => markAsPickedUp(order.donationId)}
                                            style={{marginTop: '15px'}}
                                        >
                                            Mark as Picked Up
                                        </button>
                                    )}

                                    <button className="chat-button" onClick={() => setOpenChatId(order.donationId)}>
                                        Chat with Donor
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default RecipientHistory;