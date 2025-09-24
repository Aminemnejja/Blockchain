import React from 'react';
import { Navigate } from 'react-router-dom';
import { PERMISSIONS } from './roleManager';

// HOC pour protéger les routes en fonction des permissions
export const withPermission = (WrappedComponent, requiredPermission) => {
  return function ProtectedRoute({ user, ...props }) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    const hasPermission = user.permissions.includes(requiredPermission);
    if (!hasPermission) {
      return (
        <div className="permission-denied">
          <h2>Accès Refusé</h2>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      );
    }

    return <WrappedComponent user={user} {...props} />;
  };
};

// Hook personnalisé pour vérifier les permissions
export const usePermission = (user, permission) => {
  if (!user || !user.permissions) {
    return false;
  }
  return user.permissions.includes(permission);
};

// Composant pour conditionner l'affichage en fonction des permissions
export const PermissionGate = ({ user, permission, children }) => {
  const hasPermission = usePermission(user, permission);
  return hasPermission ? children : null;
};