// auditTrail.js - Système d'audit trail pour tracer les actions
class AuditTrailManager {
  constructor() {
    this.auditLogs = [];
    this.listeners = [];
    this.initializeStorage();
  }

  // Initialiser le stockage local
  initializeStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pharma_audit_trail');
      if (stored) {
        try {
          this.auditLogs = JSON.parse(stored);
        } catch (error) {
          console.error('Erreur lors du chargement de l\'audit trail:', error);
          this.auditLogs = [];
        }
      }
    }
  }

  // Sauvegarder dans le localStorage
  saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pharma_audit_trail', JSON.stringify(this.auditLogs));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'audit trail:', error);
      }
    }
  }

  // Types d'actions possibles
  static get ACTION_TYPES() {
    return {
      PRODUCT_ADDED: 'PRODUCT_ADDED',
      PRODUCT_VIEWED: 'PRODUCT_VIEWED',
      PRODUCT_EXPORTED: 'PRODUCT_EXPORTED',
      USER_LOGIN: 'USER_LOGIN',
      USER_LOGOUT: 'USER_LOGOUT',
      ADMIN_ADDED: 'ADMIN_ADDED',
      ADMIN_REMOVED: 'ADMIN_REMOVED',
      FILTER_APPLIED: 'FILTER_APPLIED',
      SORT_APPLIED: 'SORT_APPLIED',
      SYSTEM_ERROR: 'SYSTEM_ERROR',
      PERMISSION_DENIED: 'PERMISSION_DENIED'
    };
  }

  // Niveaux de criticité
  static get SEVERITY_LEVELS() {
    return {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  // Créer un log d'audit
  createAuditLog({
    action,
    userId,
    userRole,
    details = {},
    severity = 'medium',
    ipAddress = null,
    userAgent = null,
    timestamp = Date.now()
  }) {
    const auditLog = {
      id: this.generateId(),
      action,
      userId,
      userRole,
      details,
      severity,
      ipAddress: ipAddress || this.getClientIP(),
      userAgent: userAgent || this.getUserAgent(),
      timestamp,
      date: new Date(timestamp).toISOString()
    };

    this.auditLogs.unshift(auditLog); // Ajouter au début
    
    // Limiter à 1000 entrées pour éviter la surcharge
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(0, 1000);
    }

    this.saveToStorage();
    this.notifyListeners();
    
    return auditLog;
  }

  // Générer un ID unique
  generateId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obtenir l'IP du client (simulation)
  getClientIP() {
    // En production, cela devrait être fourni par le serveur
    return '127.0.0.1';
  }

  // Obtenir l'user agent
  getUserAgent() {
    return typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown';
  }

  // Logs spécifiques pour les actions communes
  logProductAdded(userId, userRole, productData) {
    return this.createAuditLog({
      action: AuditTrailManager.ACTION_TYPES.PRODUCT_ADDED,
      userId,
      userRole,
      details: {
        productId: productData.id,
        productName: productData.name,
        category: productData.category,
        supplier: productData.supplier,
        batchNumber: productData.batchNumber
      },
      severity: AuditTrailManager.SEVERITY_LEVELS.HIGH
    });
  }

  logUserLogin(userId, userRole, loginMethod = 'wallet') {
    return this.createAuditLog({
      action: AuditTrailManager.ACTION_TYPES.USER_LOGIN,
      userId,
      userRole,
      details: { loginMethod },
      severity: AuditTrailManager.SEVERITY_LEVELS.MEDIUM
    });
  }

  logUserLogout(userId, userRole) {
    return this.createAuditLog({
      action: AuditTrailManager.ACTION_TYPES.USER_LOGOUT,
      userId,
      userRole,
      details: {},
      severity: AuditTrailManager.SEVERITY_LEVELS.LOW
    });
  }

  logAdminAction(userId, userRole, action, targetUser) {
    return this.createAuditLog({
      action: action === 'add' ? AuditTrailManager.ACTION_TYPES.ADMIN_ADDED : AuditTrailManager.ACTION_TYPES.ADMIN_REMOVED,
      userId,
      userRole,
      details: { targetUser, action },
      severity: AuditTrailManager.SEVERITY_LEVELS.CRITICAL
    });
  }

  logPermissionDenied(userId, userRole, attemptedAction) {
    return this.createAuditLog({
      action: AuditTrailManager.ACTION_TYPES.PERMISSION_DENIED,
      userId,
      userRole,
      details: { attemptedAction },
      severity: AuditTrailManager.SEVERITY_LEVELS.HIGH
    });
  }


  logSystemError(userId, userRole, error, context) {
    return this.createAuditLog({
      action: AuditTrailManager.ACTION_TYPES.SYSTEM_ERROR,
      userId,
      userRole,
      details: { error: error.message, context },
      severity: AuditTrailManager.SEVERITY_LEVELS.CRITICAL
    });
  }

  // Obtenir les logs d'audit
  getAuditLogs(filters = {}) {
    let filteredLogs = [...this.auditLogs];

    // Filtrer par utilisateur
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    // Filtrer par action
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    // Filtrer par niveau de criticité
    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    // Filtrer par date
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate);
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate);
    }

    // Limiter le nombre de résultats
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  // Obtenir les statistiques d'audit
  getAuditStats() {
    const total = this.auditLogs.length;
    const byAction = {};
    const bySeverity = {};
    const byUser = {};
    const byDay = {};

    this.auditLogs.forEach(log => {
      // Par action
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      
      // Par niveau de criticité
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
      
      // Par utilisateur
      byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      
      // Par jour
      const day = new Date(log.timestamp).toDateString();
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
      total,
      byAction,
      bySeverity,
      byUser,
      byDay,
      lastActivity: this.auditLogs[0]?.timestamp || null
    };
  }

  // Exporter les logs d'audit
  exportAuditLogs(format = 'json') {
    const logs = this.getAuditLogs();
    
    if (format === 'csv') {
      return this.convertToCSV(logs);
    }
    
    return JSON.stringify(logs, null, 2);
  }

  // Convertir en CSV
  convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['ID', 'Date', 'Action', 'User ID', 'User Role', 'Severity', 'Details'];
    const rows = logs.map(log => [
      log.id,
      log.date,
      log.action,
      log.userId,
      log.userRole,
      log.severity,
      JSON.stringify(log.details)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Nettoyer les anciens logs
  cleanOldLogs(daysToKeep = 30) {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);
    this.saveToStorage();
    this.notifyListeners();
  }

  // S'abonner aux changements
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notifier les abonnés
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.auditLogs));
  }

  // Effacer tous les logs (pour les tests)
  clearAllLogs() {
    this.auditLogs = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}

// Créer une instance unique
export const auditTrailManager = new AuditTrailManager();

export default auditTrailManager;
