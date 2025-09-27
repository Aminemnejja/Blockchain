import React from 'react';
import NotificationBell from './NotificationBell';

const Header = ({
  address,
  userRole,
  currentView,
  setCurrentView,
  handleConnect,
  handleDisconnect,
  notifications,
  unreadCount,
  onNotificationClick
}) => {
  return (
    <header className="pharma-header">
      <div className="header-content">
        <div className="logo-section">
          <span className="logo">🏥</span>
          <h1>PharmaCert</h1>
          <span className="subtitle">Certification Blockchain Pharmaceutique</span>
        </div>
        
        {/* Navigation */}
        <nav className="main-nav">
          <button 
            className={currentView === "dashboard" ? "nav-btn active" : "nav-btn"}
            onClick={() => setCurrentView("dashboard")}
          >
            🏠 Dashboard
          </button>
          {userRole === 'admin' && (
            <button 
              className={currentView === "add" ? "nav-btn active" : "nav-btn"}
              onClick={() => setCurrentView("add")}
            >
              ➕ Ajouter
            </button>
          )}
          <button 
            className={currentView === "list" ? "nav-btn active" : "nav-btn"}
            onClick={() => setCurrentView("list")}
          >
            📋 Produits
          </button>

          {userRole === 'admin' && (
            <button 
              className={currentView === "admin" ? "nav-btn active" : "nav-btn"}
              onClick={() => setCurrentView("admin")}
            >
              👑 Administration
            </button>
          )}
        </nav>
        
        {/* Connexion wallet */}
        <div className="wallet-section">
          {address && (
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onNotificationClick={onNotificationClick}
            />
          )}
          {address ? (
            <div className="wallet-connected">
              <div className="wallet-info">
                <span className={`wallet-label ${userRole}`}>
                  <span className={`role-badge ${userRole}`}>
                    {userRole === 'admin' ? '👑 ADMIN' : '👤 USER'}
                  </span>
                </span>
                <span className="wallet-address">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </span>
              </div>
              <button className="btn-disconnect" onClick={handleDisconnect}>
                🔌 Déconnecter
              </button>
            </div>
          ) : (
            <button className="btn-connect" onClick={handleConnect}>
              🔑 Connecter Petra Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
