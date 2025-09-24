export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  ADD_PRODUCT: 'add_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  VIEW_SENSITIVE: 'view_sensitive',
  MANAGE_USERS: 'manage_users',
  EXPORT_DATA: 'export_data',
  VIEW_STATS: 'view_stats',
  ASSIGN_ROLES: 'assign_roles'
};

const rolePermissions = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.VIEW_SENSITIVE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_STATS,
    PERMISSIONS.ASSIGN_ROLES
  ],
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.VIEW_SENSITIVE,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_STATS
  ],
  [ROLES.OPERATOR]: [
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.VIEW_STATS
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_STATS
  ]
};

// Classe de gestion des rôles et permissions
class RoleManager {
  constructor() {
    this.userRoles = new Map();
    this.userZones = new Map();
  }

  // Ajouter ou mettre à jour un utilisateur
  setUserRole(address, role) {
    if (!ROLES[role.toUpperCase()]) {
      throw new Error(`Rôle invalide: ${role}`);
    }
    this.userRoles.set(address, role);
  }

  // Obtenir le rôle d'un utilisateur
  getUserRole(address) {
    return this.userRoles.get(address) || ROLES.VIEWER;
  }

  // Vérifier si un utilisateur a une permission spécifique
  hasPermission(address, permission) {
    const role = this.getUserRole(address);
    return rolePermissions[role]?.includes(permission) || false;
  }

  // Définir la zone de responsabilité d'un utilisateur
  setUserZone(address, zone) {
    this.userZones.set(address, zone);
  }

  // Obtenir la zone de responsabilité d'un utilisateur
  getUserZone(address) {
    return this.userZones.get(address);
  }

  // Obtenir tous les utilisateurs avec leurs rôles
  getAllUsers() {
    const users = [];
    this.userRoles.forEach((role, address) => {
      const permissions = rolePermissions[role] || [];
      console.log(`Utilisateur ${address} avec rôle ${role} et permissions:`, permissions);
      users.push({
        address,
        role,
        zone: this.getUserZone(address) || 'Global',
        permissions: permissions
      });
    });
    return users;
  }

  // Vérifier si un utilisateur peut accéder à une zone
  canAccessZone(address, zone) {
    const userZone = this.getUserZone(address);
    if (!userZone || userZone === 'Global') return true;
    return userZone === zone;
  }
}

// Créer une instance unique du gestionnaire
const roleManager = new RoleManager();

// Exporter les fonctions helpers
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  return roleManager.hasPermission(user.address, permission);
};

export default roleManager;