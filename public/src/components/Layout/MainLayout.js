import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import MobileBottomNav from '../Navigation/MobileBottomNav';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 EventPulse. All rights reserved.</p>
            <div className="footer-links">
              <a href="/about">About</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/contact">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
