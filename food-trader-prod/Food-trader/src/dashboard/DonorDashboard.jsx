// src/dashboard/DonorDashboard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Dashboard.css';

// Fix default markers for React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DonorDashboard = () => {
    const { user } = useAuth0();
    const [formData, setFormData] = useState({ 
        foodName: '', 
        category: '', 
        quantity: '', 
        location: '',
        donorPhoneNumber: '',
        donorEmail: user?.email || '', // 👈 CAPTURING DONOR'S EMAIL
        coordinates: null 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
    const [markerPosition, setMarkerPosition] = useState(null);
    const mapRef = useRef();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = [position.coords.latitude, position.coords.longitude];
                    setMapCenter(coords);
                    setMarkerPosition(coords);
                    reverseGeocode(coords[0], coords[1]);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    setMarkerPosition(mapCenter);
                    setFormData(prev => ({
                        ...prev,
                        location: 'Chennai, Tamil Nadu, India',
                        coordinates: { lat: mapCenter[0], lng: mapCenter[1] }
                    }));
                }
            );
        }
    }, [user?.email]);

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setMarkerPosition([lat, lng]);
                setFormData(prev => ({
                    ...prev,
                    coordinates: { lat, lng }
                }));
                reverseGeocode(lat, lng);
            }
        });
        return null;
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setFormData(prev => ({
                    ...prev,
                    location: data.display_name,
                    coordinates: { lat, lng }
                }));
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            setFormData(prev => ({
                ...prev,
                location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                coordinates: { lat, lng }
            }));
        }
    };

    const searchLocation = async () => {
        if (!formData.location.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.location)}&format=json&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coords = [parseFloat(lat), parseFloat(lon)];
                setMapCenter(coords);
                setMarkerPosition(coords);
                setFormData(prev => ({
                    ...prev,
                    coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) }
                }));
                if (mapRef.current) {
                    mapRef.current.setView(coords, 15);
                }
            } else {
                alert('Location not found. Please try a different address.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            alert('Error searching for location. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.coordinates) {
            setMessage('Please select a location on the map.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:3001/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...formData, 
                    donorId: user.sub,
                    latitude: formData.coordinates.lat,
                    longitude: formData.coordinates.lng,
                    donorEmail: formData.donorEmail // 👈 PASSING EMAIL
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit donation');
            }
            setMessage('Donation submitted successfully! Check your email for confirmation.');
            setFormData({ foodName: '', category: '', quantity: '', location: '', coordinates: null, donorPhoneNumber: '', donorEmail: user?.email || '' });
            setMarkerPosition(null);
        } catch (error) {
            setMessage('Error submitting donation. Please try again.');
            console.error('Donation submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = [position.coords.latitude, position.coords.longitude];
                    setMapCenter(coords);
                    setMarkerPosition(coords);
                    if (mapRef.current) {
                        mapRef.current.setView(coords, 15);
                    }
                    reverseGeocode(coords[0], coords[1]);
                },
                (error) => {
                    alert('Unable to get your location. Please select manually on the map.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div className="dashboard-container">
            
            <div className="donation-form-container">
                <h2>Add a New Food Donation</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="foodName">Food Name</label>
                        <input type="text" id="foodName" name="foodName" value={formData.foodName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input type="text" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="donorPhoneNumber">Phone Number (for SMS alert)</label>
                        <input type="tel" id="donorPhoneNumber" name="donorPhoneNumber" value={formData.donorPhoneNumber} onChange={handleChange} required placeholder="e.g., +919876543210" />
                    </div>
                    {/* 👇 NEW EMAIL FIELD */}
                    <div className="form-group">
                        <label htmlFor="donorEmail">Donor Email (for confirmation)</label>
                        <input type="email" id="donorEmail" name="donorEmail" value={formData.donorEmail} onChange={handleChange} required placeholder="Your email address" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Pickup Location</label>
                        <div className="location-input-group">
                            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Enter address or click on map" required />
                            <button type="button" onClick={searchLocation} className="search-location-btn" disabled={!formData.location.trim()}>Search</button>
                            <button type="button" onClick={getCurrentLocation} className="current-location-btn" title="Use current location">📍</button>
                        </div>
                    </div>
                    <div className="map-container">
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '300px', width: '100%' }}
                            ref={mapRef}
                        >
                            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapClickHandler />
                            {markerPosition && (<Marker position={markerPosition} draggable={true} eventHandlers={{dragend: (e) => {const { lat, lng } = e.target.getLatLng();setMarkerPosition([lat, lng]);reverseGeocode(lat, lng);},}}/>)}
                        </MapContainer>
                        <small className="map-help-text">Click on the map to select pickup location, drag the marker to adjust, or use the 📍 button for current location</small>
                    </div>
                    <button type="submit" className="submit-button" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Donate Food'}</button>
                </form>
                {message && (<p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>)}
            </div>
        </div>
    );
};

export default DonorDashboard;