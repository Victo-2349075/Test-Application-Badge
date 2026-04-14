import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from '../composant/layout/Navbar';
import BadgeAchievementPopup from '../composant/Dashboard/Popups/BadgeAchievementPopup/BadgeAchievementPopup';
import { useAuth } from '../hooks/useAuth';

function Layout() {
  const { user } = useAuth();
  const isConnected = Boolean(user);

  return (
    <>
      <Navbar />
      <div className="main">
        <Outlet />
        {isConnected && <BadgeAchievementPopup />}
      </div>
    </>
  );
}

export default Layout;
