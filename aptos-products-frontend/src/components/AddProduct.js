import React from 'react';

const AddProduct = ({
  name,
  setName,
  category,
  setCategory,
  description,
  setDescription,
  supplier,
  setSupplier,
  batchNumber,
  setBatchNumber,
  categories,
  getCategoryColor,
  handleAddProduct,
  loading,
  address
}) => {
  return (
    <section className="form-section">
      <h2 className="section-title">
        <span className="section-icon">➕</span>
        Nouveau Produit Pharmaceutique
      </h2>
      
      <div className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label>Nom du produit *</label>
            <input
              type="text"
              placeholder="ex: Paracétamol 500mg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Catégorie *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
              style={{ borderLeftColor: getCategoryColor(category) }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fournisseur *</label>
            <input
              type="text"
              placeholder="ex: PharmaSup Inc."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Numéro de lot *</label>
            <input
              type="text"
              placeholder="ex: PSI-2025-0892"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            placeholder="Description détaillée du produit..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            rows="3"
          />
        </div>

        <button 
          onClick={handleAddProduct} 
          disabled={loading || !address}
          className="btn-submit"
        >
          {loading ? (
            <>⏳ Certification en cours...</>
          ) : (
            <>🔗 Certifier sur la Blockchain</>
          )}
        </button>
      </div>
    </section>
  );
};

export default AddProduct;
