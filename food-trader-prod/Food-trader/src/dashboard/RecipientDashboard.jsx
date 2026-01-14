// src/dashboard/RecipientDashboard.jsx (UPDATED with Custom Toast Notification)

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Dashboard.css';

// --- NEW: Toast Notification Component ---
// This component will be triggered by our message state
const ToastNotification = ({ message, type, onClear }) => {
    useEffect(() => {
        // Set a timer to clear the message after 3 seconds
        const timer = setTimeout(() => {
            onClear();
        }, 3000); // 3000ms = 3 seconds

        // Cleanup the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [message, onClear]);

    return (
        <div className={`toast-notification ${type}`}>
            {message}
        </div>
    );
};
// ----------------------------------------

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecipientDashboard = () => {
    const { user } = useAuth0();
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
    const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/donations');
                if (!response.ok) {
                    throw new Error('Failed to fetch donations');
                }
                const data = await response.json();
                setDonations(data);

                if (data.length > 0) {
                    const firstDonationCoords = [data[0].latitude, data[0].longitude];
                    if (firstDonationCoords[0] && firstDonationCoords[1]) {
                        setMapCenter(firstDonationCoords);
                    }
                }
            } catch (error) {
                setMessageType('error');
                setMessage('Error fetching donations. Please try again.');
                console.error('Donation fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const handleOrder = async (donationId) => {
        setMessage(''); // Clear any old messages
        try {
            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    recipientId: user.sub, 
                    donationId,
                    recipientEmail: user.email 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to order item');
            }

            // Remove the claimed item from the map
            setDonations(prevDonations => prevDonations.filter(d => d.id !== donationId));
            
            // 👇 THIS IS THE CHANGED LINE 👇
            // Set the state to trigger the ToastNotification
            setMessageType('success');
            setMessage('Item ordered successfully! Check your email for confirmation.');

        } catch (error) {
            // 👇 ALSO CHANGED THE ERROR TO A TOAST 👇
            setMessageType('error');
            setMessage('Error ordering item. Please try again.');
            console.error('Order error:', error);
        }
    };

    if (isLoading) {
        return <div className="dashboard-container">Loading donations...</div>;
    }

    return (
        // The dashboard-container must be relative for the toast to position correctly
        <div className="dashboard-container" style={{ position: 'relative' }}>
        
            {/* Render the Toast Notification when message exists */}
            {message && (
                <ToastNotification 
                    message={message} 
                    type={messageType} 
                    onClear={() => setMessage('')} 
                />
            )}

            {/* The header is handled by DashboardRouter.jsx */}
            {/* <header className="dashboard-header">...</header> */}

            <div className="map-container">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '500px', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {donations.map(donation => {
                        if (donation.latitude && donation.longitude) {
                            return (
                                <Marker 
                                    key={donation.id} 
                                    position={[donation.latitude, donation.longitude]}
                                >
                                    <Popup>
                                        <h3>{donation.foodName}</h3>
                                        <p>Category: <span>{donation.category}</span></p>
                                        <p>Quantity: <span>{donation.quantity}</span></p>
                                        <p>Location: {donation.location}</p>
                                        <button 
                                            className="order-button"
                                            onClick={() => handleOrder(donation.id)}
                                        >
                                            Order Item
                                        </button>
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapContainer>
            </div>
            
            {/* We no longer need the old <p> message tag */}
        </div>
    );
};

export default RecipientDashboard;