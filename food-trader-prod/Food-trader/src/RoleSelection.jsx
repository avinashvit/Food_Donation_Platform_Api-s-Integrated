// src/RoleSelection.jsx (UPDATED)

import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const RoleSelection = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleRoleSave = async () => {
    setIsSaving(true);
    try {
      // 👇 NEW: Make a POST request to your backend
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sub: user.sub, // Use the unique Auth0 user ID
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save role');
      }

      navigate('/dashboard');

    } catch (error) {
      console.error("Error saving role:", error);
      setIsSaving(false);
    }
  };

  return (
    // ... (rest of your component code remains the same)
    <div className="login-container">
            <div className="login-box">
                <h1>Welcome, {user.name}!</h1>
                <p>Please select your role to continue:</p>
                <div className="role-options">
                    <button
                        className={`role-button ${selectedRole === 'donor' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('donor')}
                    >
                        I am a Donor
                    </button>
                    <button
                        className={`role-button ${selectedRole === 'recipient' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('recipient')}
                    >
                        I am a Recipient
                    </button>
                </div>
                <button
                    className="login-button-purple"
                    onClick={handleRoleSave}
                    disabled={!selectedRole || isSaving}
                >
                    {isSaving ? 'Saving...' : 'Continue'}
                </button>
            </div>
        </div>
  );
};

export default RoleSelection;