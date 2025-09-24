import React, { useState, useEffect, useRef } from 'react';

const NotificationBell = ({ notifications, onNotificationClick, unreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer le clic sur une notification
  const handleNotificationClick = (id, event) => {
    event.stopPropagation();
    onNotificationClick(id);
    // Ne pas fermer le menu lors du clic sur une notification
  };

  // Gérer le clic sur "Tout marquer comme lu"
  const handleMarkAllAsRead = (event) => {
    event.stopPropagation();
    onNotificationClick('all');
  };

  return (
    <div className="notification-container" ref={containerRef}>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="btn-clear" 
                onClick={handleMarkAllAsRead}
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
                  onClick={(e) => handleNotificationClick(notif.id, e)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notification-icon">
                    {notif.type === 'product' ? '📦' : 
                     notif.type === 'certification' ? '✅' : 
                     notif.type === 'admin' ? '👑' : '🔔'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">
                      {new Date(notif.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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