// src/Pages/dashboard/Dashboard.js
import React from 'react';
import './Dashboard.css';
import UnitedWhiteLogo from "../../Assets/UnitedWhiteLogo.png";
import Plane from "../../Assets/plane.png";
import { FaBars, FaHome, FaSyncAlt, FaPhone, FaPlane, FaWifi, FaLightbulb, FaTv, FaBluetooth } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img src={UnitedWhiteLogo} className="united-logo" alt="United Logo" />
        <FaBars className="menu-icon" />
      </header>
      <main className="dashboard-content">
        <h2>Flights ✈️</h2>
        <br />
        <div className="flight-info">
          <div className="flight-card">
            <div className="flight-details">
              <img src={Plane} className="plane-image" alt="Plane" />
              <div className="flight-info-text">
                <p className="plane-model">Boeing 7387-900</p>
                <p className="plane-name">“Patterson” Coming from Dallas, Texas</p>
              </div>
            </div>
            <div className="flight-route">
              <span>Chicago (ORD)</span>
              <div className="progress-bar-container">
                <div className="progress-bar"></div>
              </div>
              <span>San Francisco (SFO)</span>
            </div>
            <div className="flight-eta">ETA: 4 hours 45 mins</div>
            <div className="seat-and-amenities">
              <div className="flight-seat">
                <p>31D</p>
                <span>Seat</span>
              </div>
              <div className="divider"></div>
              <div className="flight-amenities">
                <span>Available on Flight:</span>
                <div className="amenities-icons">
                  <div className="icon-container"><FaWifi /></div>
                  <div className="icon-container"><FaLightbulb /></div>
                  <div className="icon-container"><FaTv /></div>
                  <div className="icon-container"><FaBluetooth /></div>
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>
      </main>
      <footer className="dashboard-footer">
        <div className="footer-icons">
          <FaHome />
          <FaSyncAlt />
          <FaPhone />
          <FaPlane />
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
