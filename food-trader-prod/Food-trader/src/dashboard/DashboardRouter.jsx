// src/dashboard/DashboardRouter.jsx (MODIFIED)

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, Link } from 'react-router-dom';
import DonorDashboard from './DonorDashboard';
import RecipientDashboard from './RecipientDashboard';

const DashboardRouter = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [userRole, setUserRole] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user?.sub) {
                setIsRoleLoading(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:3001/api/users/${user.sub}`);
                if (response.status === 404) {
                    setUserRole(null);
                } else if (!response.ok) {
                    throw new Error('Failed to fetch user role');
                } else {
                    const data = await response.json();
                    setUserRole(data.role);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            } finally {
                setIsRoleLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchUserRole();
        } else {
            setIsRoleLoading(false);
        }
    }, [isAuthenticated, user]);

    if (isLoading || isRoleLoading) {
        // Simple loading text for the router
        return <div style={{ background: '#1d021f', minHeight: '100vh', color: 'white', padding: '2rem' }}>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    if (!userRole) {
        return <Navigate to="/select-role" />;
    }

    // Determine the correct title and history link based on role
    const title = userRole === 'donor' ? "Donor Dashboard" : "Recipient Dashboard";
    const historyLink = userRole === 'donor' ? "/donor/history" : "/recipient/history";
    const historyText = userRole === 'donor' ? "My Donation History" : "My Order History";

    return (
        <div className="dashboard-container">
            {/* --- THIS IS THE NEW NAVBAR --- */}
            <header className="dashboard-navbar">
                <div className="navbar-brand">
                    <h1>{title}</h1>
                </div>
                <nav className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/select-role" className="nav-link">Change Role</Link>
                    <Link to={historyLink} className="nav-link">{historyText}</Link>
                </nav>
            </header>
            
            {/* The main content (Donor or Recipient dashboard) renders below the navbar */}
            {userRole === 'donor' ? <DonorDashboard /> : <RecipientDashboard />}
        </div>
    );
};

export default DashboardRouter;