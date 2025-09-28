import React from 'react';
import { generateProductPDF } from '../utils/pdfUtils';

const ProductListWrapper = ({
  productsList,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  getFilteredProducts,
  getCategoryColor,
  formatArrivalDate,
  userRole,
  categories,
  userId
}) => {
  // Gestionnaire de recherche
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };
  return (
    <section className="list-section">
      <h2 className="section-title">
        <span className="section-icon">📋</span>
        Liste des Produits Certifiés
      </h2>
      
      {/* Filtres */}
      <div className="filters-bar">
        <div className="search-group">
            <input
              type="text"
              placeholder="🔍 Rechercher par nom, fournisseur ou lot..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
        </div>
        
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="name">Par nom</option>
          </select>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="products-grid">
        {getFilteredProducts().map(product => (
          <div key={product.id} className="product-card-full">
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
              {userRole === 'admin' && (
                <span className="admin-badge">Admin Only</span>
              )}
            </div>
            
            <div className="product-details">
              <div className="detail-row">
                <span className="detail-label">Catégorie:</span>
                <span className="detail-value">
                  {categories.find(c => c.value === product.category)?.label || product.category}
                </span>
              </div>
              
              {/* Information sensible visible uniquement par les admins */}
              {userRole === 'admin' && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Fournisseur:</span>
                    <span className="detail-value">{product.supplier}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Lot:</span>
                    <span className="detail-value">{product.batchNumber}</span>
                  </div>
                </>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Date d'arrivée:</span>
                <span className="detail-value">
                  {formatArrivalDate(product.arrival_date)}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{product.description}</span>
              </div>

              {userRole === 'admin' && (
                <div className="admin-actions">
                  <button 
                    className="btn-secondary"
                    onClick={async () => {
                      try {
                        await generateProductPDF(product, categories);
                        console.log('PDF généré avec succès pour le produit:', product.id);
                      } catch (error) {
                        console.error('Erreur lors de la génération du PDF:', error);
                        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
                      }
                    }}
                  >
                    📄 Exporter PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {getFilteredProducts().length === 0 && (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>Aucun produit trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductListWrapper;
