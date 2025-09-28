import React from 'react';

const Dashboard = ({ 
  userRole, 
  productsList, 
  stats, 
  getCategoryColor, 
  formatArrivalDate 
}) => {
  return (
    <>
      {userRole === 'admin' ? (
        <section className="stats-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Tableau de Bord Administrateur
          </h2>
          
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Produits Total</div>
            </div>
            <div className="stat-card certified">
              <div className="stat-value">{stats.certified}</div>
              <div className="stat-label">Certifiés</div>
            </div>
            <div className="stat-card today">
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">Aujourd'hui</div>
            </div>
          </div>
        </section>
      ) : (
        <section className="stats-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Tableau de Bord Utilisateur
          </h2>
          
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Produits</div>
            </div>
          </div>
        </section>
      )}

      <section className="recent-section">
        <h3 className="section-title">
          <span className="section-icon">🕒</span>
          Derniers Produits
        </h3>
        
        <div className="recent-products">
          {productsList.slice(0, 3).map(product => (
            <div key={product.id} className="recent-product-card">
              <div className="product-header">
                <span 
                  className="product-id"
                  style={{ backgroundColor: getCategoryColor(product.category) }}
                >
                  #{product.id}
                </span>
                <h4 className="product-name">{product.name}</h4>
                <span className={`status-badge certified`}>
                  ✅ Certifié
                </span>
              </div>
              <div className="product-details">
                <span className="product-supplier">{product.supplier}</span>
                <span className="product-time">
                  {formatArrivalDate(product.arrival_date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
