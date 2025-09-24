import React, { useState } from 'react';
import { ROLES, PERMISSIONS } from '../utils/roleManager';

const UserDashboard = ({ users, onUpdateUser, onDeleteUser }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [newZone, setNewZone] = useState('');
  const [newRole, setNewRole] = useState('');

  // Zones disponibles (à personnaliser selon vos besoins)
  const zones = ['Global', 'Production', 'Qualité', 'Stockage', 'Laboratoire'];

  const handleSave = (user) => {
    onUpdateUser({
      ...user,
      role: newRole || user.role,
      zone: newZone || user.zone
    });
    setEditingUser(null);
    setNewRole('');
    setNewZone('');
  };

  return (
    <div className="user-dashboard">
      <div className="user-list">
        <table className="user-table">
          <thead>
            <tr>
              <th>Adresse</th>
              <th>Rôle</th>
              <th>Zone</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.address} className={editingUser === user.address ? 'editing' : ''}>
                <td className="user-address">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </td>
                <td>
                  {editingUser === user.address ? (
                    <select
                      value={newRole || user.role}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="role-select"
                    >
                      {Object.values(ROLES).map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`role-badge ${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </td>
                <td>
                  {editingUser === user.address ? (
                    <select
                      value={newZone || user.zone}
                      onChange={(e) => setNewZone(e.target.value)}
                      className="zone-select"
                    >
                      {zones.map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="zone-badge">{user.zone}</span>
                  )}
                </td>
                <td>
                  <div className="permissions-list">
                    {user.permissions.map((permission) => (
                      <span key={permission} className="permission-badge">
                        {permission.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {editingUser === user.address ? (
                    <div className="action-buttons">
                      <button 
                        className="btn-save" 
                        onClick={() => handleSave(user)}
                      >
                        💾 Sauvegarder
                      </button>
                      <button 
                        className="btn-cancel" 
                        onClick={() => {
                          setEditingUser(null);
                          setNewRole('');
                          setNewZone('');
                        }}
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => setEditingUser(user.address)}
                      >
                        ✏️ Éditer
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => onDeleteUser(user.address)}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDashboard;