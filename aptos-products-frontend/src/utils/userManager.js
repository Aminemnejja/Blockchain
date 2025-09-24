// userManager.js
import { ROLES, PERMISSIONS } from './roleManager';

// Simulation de la base de données utilisateur (à remplacer par des appels au smart contract)
let usersDB = new Map();

export const initializeUser = (address) => {
  if (!usersDB.has(address)) {
    // Par défaut, le premier utilisateur est administrateur
    const isFirstUser = usersDB.size === 0;
    const defaultUser = {
      address,
      role: isFirstUser ? ROLES.ADMIN : ROLES.VIEWER,
      zone: 'Global',
      permissions: isFirstUser ? Object.values(PERMISSIONS) : [PERMISSIONS.VIEW_PRODUCTS]
    };
    usersDB.set(address, defaultUser);
    return defaultUser;
  }
  return usersDB.get(address);
};

export const updateUser = (address, updates) => {
  if (!usersDB.has(address)) {
    throw new Error("User not found");
  }
  const user = usersDB.get(address);
  const updatedUser = { ...user, ...updates };
  usersDB.set(address, updatedUser);
  return updatedUser;
};

export const deleteUser = (address) => {
  if (!usersDB.has(address)) {
    throw new Error("User not found");
  }
  usersDB.delete(address);
};

export const getAllUsers = () => {
  return Array.from(usersDB.values());
};

export const getUserByAddress = (address) => {
  return usersDB.get(address);
};

// Fonctions supplémentaires pour la gestion des utilisateurs
export const addUserToZone = (address, zone) => {
  const user = getUserByAddress(address);
  if (user) {
    updateUser(address, { zone });
    return true;
  }
  return false;
};

export const updateUserRole = (address, newRole) => {
  const user = getUserByAddress(address);
  if (user) {
    const rolePermissions = {
      [ROLES.ADMIN]: Object.values(PERMISSIONS),
      [ROLES.SUPERVISOR]: [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.ADD_PRODUCT,
        PERMISSIONS.APPROVE_PRODUCT,
        PERMISSIONS.VIEW_USERS
      ],
      [ROLES.OPERATOR]: [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.ADD_PRODUCT
      ],
      [ROLES.VIEWER]: [
        PERMISSIONS.VIEW_PRODUCTS
      ]
    };

    updateUser(address, {
      role: newRole,
      permissions: rolePermissions[newRole] || []
    });
    return true;
  }
  return false;
};