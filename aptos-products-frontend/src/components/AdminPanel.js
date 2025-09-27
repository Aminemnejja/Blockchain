import React from 'react';
import auditTrailManager from '../utils/auditTrail';

const AdminPanel = ({
  newAdminAddress,
  setNewAdminAddress,
  adminList,
  setAdminList,
  address,
  setSuccess,
  userRole
}) => {
  const handleAddAdmin = () => {
    if (newAdminAddress) {
      setAdminList([...adminList, { 
        address: newAdminAddress, 
        dateAdded: Date.now() 
      }]);
      
      // Log d'audit pour l'ajout d'admin
      auditTrailManager.logAdminAction(address, userRole, 'add', newAdminAddress);
      
      setNewAdminAddress("");
      setSuccess("Administrateur ajouté avec succès");
    }
  };

  const handleRemoveAdmin = (index) => {
    const adminToRemove = adminList[index];
    setAdminList(adminList.filter((_, i) => i !== index));
    
    // Log d'audit pour la suppression d'admin
    auditTrailManager.logAdminAction(address, userRole, 'remove', adminToRemove.address);
    
    setSuccess("Administrateur retiré avec succès");
  };

  return (
    <section className="admin-section">
      <h2 className="section-title">
        <span className="section-icon">👑</span>
        Administration
      </h2>
      
      <div className="admin-card">
        <h3 className="admin-subtitle">Gestion des Administrateurs</h3>
        
        <div className="form-card">
          <div className="form-group">
            <label>Ajouter un administrateur</label>
            <div className="admin-add-group">
              <input
                type="text"
                placeholder="Adresse du wallet (0x...)"
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
                className="form-input"
              />
              <button 
                className="btn-secondary"
                onClick={handleAddAdmin}
              >
                ➕ Ajouter
              </button>
            </div>
          </div>

          <div className="admin-list">
            <h4>Liste des Administrateurs</h4>
            {adminList.map((admin, index) => (
              <div key={index} className="admin-item">
                <div className="admin-info">
                  <span className="admin-address">{admin.address}</span>
                  <span className="admin-date">
                    Ajouté le {new Date(admin.dateAdded).toLocaleDateString()}
                  </span>
                </div>
                {admin.address !== address && (
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemoveAdmin(index)}
                  >
                    ❌ Retirer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
