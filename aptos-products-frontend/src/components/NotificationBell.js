import React, { useState, useEffect, useRef } from 'react';

const NotificationBell = ({ notifications, onNotificationClick, unreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Gérer les clics en dehors du menu pour le fermer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer le clic sur une notification
  const handleNotificationClick = (notif) => {
    onNotificationClick(notif.id);
    setIsOpen(false);
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" ref={dropdownRef}>
          <div className="notification-header">
            <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
            {notifications.length > 0 && (
              <button 
                className="btn-clear" 
                onClick={(e) => {
                  e.stopPropagation();
                  onNotificationClick('all');
                }}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notifications-icon">🔔</span>
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${notif.read ? '' : 'unread'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationClick(notif);
                  }}
                >
                  <div className="notification-icon">
                    {notif.type === 'product' ? '📦' : 
                     notif.type === 'certification' ? '✅' : 
                     notif.type === 'admin' ? '👑' : '🔔'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">
                      {new Date(notif.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  {!notif.read && <div className="notification-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;