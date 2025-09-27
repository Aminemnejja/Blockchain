import React, { useState, useEffect } from 'react';
import auditTrailManager from '../utils/auditTrail';

const AuditTrail = ({ userId, userRole }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    startDate: '',
    endDate: '',
    limit: 50
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  // Charger les logs d'audit
  useEffect(() => {
    const loadAuditLogs = () => {
      setLoading(true);
      try {
        const logs = auditTrailManager.getAuditLogs(filters);
        setAuditLogs(logs);
        setStats(auditTrailManager.getAuditStats());
      } catch (error) {
        console.error('Erreur lors du chargement des logs d\'audit:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();

    // S'abonner aux changements
    const unsubscribe = auditTrailManager.subscribe((logs) => {
      setAuditLogs(auditTrailManager.getAuditLogs(filters));
      setStats(auditTrailManager.getAuditStats());
    });

    return unsubscribe;
  }, [filters]);

  // Gestionnaire de changement de filtre
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Exporter les logs
  const handleExport = () => {
    try {
      const data = auditTrailManager.exportAuditLogs(exportFormat);
      const blob = new Blob([data], { 
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_trail_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };


  // Obtenir l'icône pour l'action
  const getActionIcon = (action) => {
    const icons = {
      PRODUCT_ADDED: '➕',
      PRODUCT_VIEWED: '👁️',
      PRODUCT_EXPORTED: '📄',
      USER_LOGIN: '🔑',
      USER_LOGOUT: '🚪',
      ADMIN_ADDED: '👑',
      ADMIN_REMOVED: '❌',
      FILTER_APPLIED: '🔽',
      SORT_APPLIED: '🔄',
      SYSTEM_ERROR: '⚠️',
      PERMISSION_DENIED: '🚫'
    };
    return icons[action] || '📝';
  };

  // Obtenir la couleur pour le niveau de criticité
  const getSeverityColor = (severity) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[severity] || '#6b7280';
  };

  // Formater la date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="audit-trail">
      <div className="audit-header">
        <h2 className="section-title">
          <span className="section-icon">📋</span>
          Historique des Actions (Audit Trail)
        </h2>
        
        <div className="audit-actions">
          <button 
            className="btn-secondary"
            onClick={handleExport}
          >
            📥 Exporter
          </button>
          <select 
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="form-select"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="audit-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Actions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(stats.byUser).length}</div>
            <div className="stat-label">Utilisateurs Actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.bySeverity.critical || 0}</div>
            <div className="stat-label">Actions Critiques</div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="audit-filters">
        <div className="filter-group">
          <label>Action:</label>
          <select 
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="form-select"
          >
            <option value="">Toutes les actions</option>
            <option value="PRODUCT_ADDED">Ajout de produit</option>
            <option value="USER_LOGIN">Connexion</option>
            <option value="ADMIN_ADDED">Ajout admin</option>
            <option value="ADMIN_REMOVED">Suppression admin</option>
            <option value="SYSTEM_ERROR">Erreur système</option>
            <option value="PERMISSION_DENIED">Permission refusée</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Criticité:</label>
          <select 
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="form-select"
          >
            <option value="">Tous les niveaux</option>
            <option value="low">Faible</option>
            <option value="medium">Moyen</option>
            <option value="high">Élevé</option>
            <option value="critical">Critique</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Limite:</label>
          <select 
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="form-select"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="audit-logs">
        {loading ? (
          <div className="loading-indicator">
            <span>⏳ Chargement des logs...</span>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="no-logs">
            <span className="no-logs-icon">📝</span>
            <h3>Aucun log d'audit trouvé</h3>
            <p>Les actions seront enregistrées ici</p>
          </div>
        ) : (
          <div className="logs-list">
            {auditLogs.map((log) => (
              <div key={log.id} className="audit-log-item">
                <div className="log-header">
                  <span className="log-icon">{getActionIcon(log.action)}</span>
                  <div className="log-info">
                    <div className="log-action">{log.action.replace(/_/g, ' ')}</div>
                    <div className="log-user">
                      {log.userId} ({log.userRole})
                    </div>
                  </div>
                  <div className="log-meta">
                    <span 
                      className="log-severity"
                      style={{ color: getSeverityColor(log.severity) }}
                    >
                      {log.severity.toUpperCase()}
                    </span>
                    <span className="log-date">{formatDate(log.timestamp)}</span>
                  </div>
                </div>
                
                {Object.keys(log.details).length > 0 && (
                  <div className="log-details">
                    <details>
                      <summary>Détails</summary>
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
