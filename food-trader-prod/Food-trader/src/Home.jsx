// src/Home.jsx

import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Home.css'; // Your existing CSS will be loaded

function Home() {
  const { isAuthenticated, user, logout, isLoading: isAuthLoading } = useAuth0();
  const [randomMeal, setRandomMeal] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(true);
  
  // --- NEW STATE for the slide-in menu ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/random.php')
      .then(response => response.json())
      .then(data => {
        setRandomMeal(data.meals[0]);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsMealLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      
      {/* --- Menu Toggle Pill --- */}
      <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
        Menu +
      </button>

      {/* --- Glossy Slide-in Menu (with UPDATED links) --- */}
      <nav className={`glossy-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
          &times; {/* This is an "X" icon */}
        </button>
        <div className="glossy-menu-links">
          {/* --- LINKS UPDATED AS REQUESTED --- */}
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          <Link to="/about-us" onClick={() => setIsMenuOpen(false)}>About Us</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
          {/* --- END OF UPDATED LINKS --- */}
        </div>
      </nav>

      {/* --- This is your EXISTING header for the right side --- */}
      <header className="home-header">
        {isAuthLoading ? (
          <div className="login-button">Loading...</div>
        ) : isAuthenticated ? (
          <div className="user-info">
            <span className="welcome-message" style={{ marginRight: '15px', color: '#333', fontWeight: 'bold' }}>
                Welcome, {user.name}!
            </span>
            <Link to="/dashboard" className="login-button" style={{ marginRight: '15px' }}>
              Go to Dashboard
            </Link>
            <button 
              className="login-button" 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log Out
            </button>
          </div>
        ) : (
          <Link to='/login' className="login-button">
            Login / Register
          </Link>
        )}
      </header>

      {/* --- This is your EXISTING main content --- */}
      <main className="home-content">
        <h1 className="platform-title">
          Food Donation <br /> Platform
        </h1>
      </main>
      
      <div className="food-fact-container">
        <h3>Food for Thought</h3>
        {isMealLoading ? ( 
          <p>Fetching inspiration...</p>
        ) : randomMeal ? (
          <div className="meal-item">
            <img src={randomMeal.strMealThumb} alt={randomMeal.strMeal} />
            <h4>{randomMeal.strMeal}</h4>
            <p>Category: <span>{randomMeal.strCategory}</span></p>
          </div>
        ) : (
          <p>Could not load inspiration. Please try again later.</p>
        )}
      </div>
    </div>
  );
}

export default Home;