// src/login.jsx

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the dashboard after successful login
    if (isAuthenticated) {
      navigate('/dashboard'); // 👈 Change '/' to '/dashboard'
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    await loginWithRedirect();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome</h1>
        <p>Please log in or sign up to continue to the Food Donation Platform.</p>
        <button className="login-button-purple" onClick={handleLogin}>
          Login / Sign Up
        </button>
      </div>
    </div>
  );
}

export default Login;