// src/App.js - ÉTAPE 1: Interface PharmaCert de base
import React, { useState } from "react";
import { connectWallet, disconnectWallet } from "./aptosClient";
import { addProduct, getProduct } from "./aptosFunctions";
import "./pharma-styles.css"; // Nouveau fichier CSS

function App() {
  const [address, setAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // États du formulaire pharmaceutique
  const [name, setName] = useState("");
  const [category, setCategory] = useState("principe-actif");
  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  // Catégories pharmaceutiques
  const categories = [
    { value: "principe-actif", label: "🟢 Principe Actif", color: "#22c55e" },
    { value: "excipient", label: "🔵 Excipient", color: "#3b82f6" },
    { value: "emballage", label: "🟡 Emballage Primaire", color: "#eab308" },
    { value: "matiere-premiere", label: "🟣 Matière Première", color: "#8b5cf6" }
  ];

  // Connexion wallet
  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      if (addr) setAddress(addr);
    } catch (err) {
      setError("Erreur de connexion au wallet: " + err.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setAddress("");
    } catch (err) {
      setError("Erreur de déconnexion: " + err.message);
    }
  };

  // Ajouter un produit pharmaceutique
  const handleAddProduct = async () => {
    if (!window.petra) {
      setError("Petra Wallet non connecté");
      return;
    }

    if (!name || !category || !description || !supplier || !batchNumber) {
      setError("Tous les champs du formulaire sont obligatoires");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Créer description enrichie avec les données pharmaceutiques
      const enrichedDescription = `${description} | Fournisseur: ${supplier} | Lot: ${batchNumber}`;
      
      const hash = await addProduct(name, category, enrichedDescription, window.petra);
      setTxHash(hash);

      // Reset form
      setName("");
      setCategory("principe-actif");
      setDescription("");
      setSupplier("");
      setBatchNumber("");
    } catch (err) {
      setError("Erreur lors de l'ajout: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lire un produit
  const handleGetProduct = async () => {
    if (!address) {
      setError("Veuillez d'abord connecter votre wallet pour obtenir l'adresse");
      return;
    }

    setLoading(true);
    setError("");
    setProductData(null);

    try {
      const result = await getProduct(address, 1);
      setProductData(result);
    } catch (err) {
      setError("Erreur lors de la récupération: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  // Obtenir la couleur de la catégorie
  const getCategoryColor = (catValue) => {
    const cat = categories.find(c => c.value === catValue);
    return cat ? cat.color : "#6b7280";
  };

  // Formater la date d'arrivée
  const formatArrivalDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pharma-app">
      {/* Header */}
      <header className="pharma-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo">🏥</span>
            <h1>PharmaCert</h1>
            <span className="subtitle">Certification Blockchain Pharmaceutique</span>
          </div>
          
          {/* Connexion wallet */}
          <div className="wallet-section">
            {address ? (
              <div className="wallet-connected">
                <div className="wallet-info">
                  <span className="wallet-label">Wallet connecté</span>
                  <span className="wallet-address">{address.slice(0, 8)}...{address.slice(-6)}</span>
                </div>
                <button className="btn-disconnect" onClick={handleDisconnect}>
                  🔌 Déconnecter
                </button>
              </div>
            ) : (
              <button className="btn-connect" onClick={handleConnect}>
                🔑 Connecter Petra Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pharma-main">
        {/* Messages d'erreur */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Formulaire d'ajout */}
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

        {/* Section consultation */}
        <section className="consultation-section">
          <h2 className="section-title">
            <span className="section-icon">🔍</span>
            Consulter les Certifications
          </h2>
          
          <div className="consultation-card">
            <button 
              onClick={handleGetProduct} 
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? "⏳ Chargement..." : "📋 Afficher Produit (ID=1)"}
            </button>
          </div>
        </section>

        {/* Résultat transaction */}
        {txHash && (
          <section className="result-section success">
            <h3>✅ Certification Réussie</h3>
            <p>
              Transaction blockchain :{" "}
              <a
                href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                Voir sur Aptos Explorer
              </a>
            </p>
          </section>
        )}

        {/* Résultat produit */}
        {productData && (
          <section className="result-section">
            <h3 className="result-title">
              <span className="result-icon">📄</span>
              Données Certifiées
            </h3>
            
            <div className="product-cards">
              {productData.data?.products?.map((product, index) => (
                <div key={index} className="product-card">
                  <div className="product-header">
                    <span 
                      className="product-id"
                      style={{ backgroundColor: getCategoryColor(product.category) }}
                    >
                      #{product.id}
                    </span>
                    <h4 className="product-name">{product.name}</h4>
                  </div>
                  
                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Catégorie:</span>
                      <span className="detail-value">
                        {categories.find(c => c.value === product.category)?.label || product.category}
                      </span>
                    </div>
                    
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
                  </div>
                </div>
              ))}
            </div>
            
            {/* Debug JSON (à retirer plus tard) */}
            <details className="debug-section">
              <summary>🔧 Données brutes (développement)</summary>
              <pre className="debug-json">{JSON.stringify(productData, null, 2)}</pre>
            </details>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;