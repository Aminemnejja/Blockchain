// src/App.js - ÉTAPE 2: Fonctionnalités avancées PharmaCert
import React, { useState, useEffect } from "react";
import { addProduct, getProduct, getAllProducts } from "./aptosFunctions";
import { generateProductPDF } from "./utils/pdfUtils";
import { ToastContainer, toast } from 'react-toastify';
import NotificationBell from './components/NotificationBell';
import notificationManager from './utils/notificationManager';
import 'react-toastify/dist/ReactToastify.css';
import "./pharma-styles.css";

function App() {
  const [address, setAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Nouvel état pour la gestion des rôles
  const [userRole, setUserRole] = useState(null); // 'admin' ou 'user'

  // États du formulaire pharmaceutique
  const [name, setName] = useState("");
  const [category, setCategory] = useState("principe-actif");
  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  
  // États pour la navigation et les fonctionnalités
  const [currentView, setCurrentView] = useState("dashboard");
  const [productsList, setProductsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [productIdToSearch, setProductIdToSearch] = useState("1");
  // États pour la gestion des administrateurs
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [adminList, setAdminList] = useState([
    // Liste initiale des administrateurs
    { address: "0x123...", dateAdded: Date.now() }
  ]);

  // États pour les notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auto-clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Effet pour les notifications
  useEffect(() => {
    // S'abonner aux notifications
    const unsubscribe = notificationManager.subscribe((notifications) => {
      setNotifications(notifications);
      setUnreadCount(notificationManager.getUnreadCount());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Charger les produits depuis la blockchain, fallback sur des mocks si nécessaire
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setLoading(true);
      try {
        // Par défaut on lit depuis le module (adresse module) pour récupérer la registry globale
        const onchain = await getAllProducts();
        if (mounted && Array.isArray(onchain) && onchain.length > 0) {
          setProductsList(onchain);
        } else {
          // fallback : mocks locaux (utile en dev)
          console.warn('Aucun produit on-chain trouvé, utilisation des mocks');
          const mockProducts = [
            {
              id: "1",
              name: "Paracétamol 500mg",
              category: "principe-actif",
              supplier: "PharmaSup Inc.",
              batchNumber: "PSI-2025-0892",
              description: "Principe actif pour analgésique",
              arrival_date: Math.floor(Date.now() / 1000) - 3600,
              status: "certified"
            },
            {
              id: "2", 
              name: "Lactose Monohydraté",
              category: "excipient",
              supplier: "ExciCorp Ltd.",
              batchNumber: "ECL-2025-0156",
              description: "Excipient de remplissage",
              arrival_date: Math.floor(Date.now() / 1000) - 7200,
              status: "certified"
            },
            {
              id: "3",
              name: "Blister PVC/Alu",
              category: "emballage",
              supplier: "PackPharma SA",
              batchNumber: "PPS-2025-0234",
              description: "Emballage primaire sécurisé",
              arrival_date: Math.floor(Date.now() / 1000) - 1800,
              status: "certified"
            }
          ];
          if (mounted) setProductsList(mockProducts);
        }
      } catch (err) {
        console.error('Erreur lors du chargement on-chain, utilisation des mocks', err);
        if (mounted) {
          const mockProducts = [
            {
              id: "1",
              name: "Paracétamol 500mg",
              category: "principe-actif",
              supplier: "PharmaSup Inc.",
              batchNumber: "PSI-2025-0892",
              description: "Principe actif pour analgésique",
              arrival_date: Math.floor(Date.now() / 1000) - 3600,
              status: "certified"
            },
            {
              id: "2", 
              name: "Lactose Monohydraté",
              category: "excipient",
              supplier: "ExciCorp Ltd.",
              batchNumber: "ECL-2025-0156",
              description: "Excipient de remplissage",
              arrival_date: Math.floor(Date.now() / 1000) - 7200,
              status: "certified"
            },
            {
              id: "3",
              name: "Blister PVC/Alu",
              category: "emballage",
              supplier: "PackPharma SA",
              batchNumber: "PPS-2025-0234",
              description: "Emballage primaire sécurisé",
              arrival_date: Math.floor(Date.now() / 1000) - 1800,
              status: "certified"
            }
          ];
          setProductsList(mockProducts);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();

    return () => { mounted = false; };
  }, []);

  // Catégories pharmaceutiques
  const categories = [
    { value: "principe-actif", label: "🟢 Principe Actif", color: "#22c55e" },
    { value: "excipient", label: "🔵 Excipient", color: "#3b82f6" },
    { value: "emballage", label: "🟡 Emballage Primaire", color: "#eab308" },
    { value: "matiere-premiere", label: "🟣 Matière Première", color: "#8b5cf6" }
  ];

  // Liste des adresses administrateurs
  const adminAddresses = [
    "0x6c940c3205cb7d3b40a2fbb4e550aabaf7a13bb3f92465ac2fe4b31bbd664e02", // Adresse admin principale
  ];  // Connexion wallet
  const handleConnect = async () => {
    try {
      const { address } = await window.petra.connect();
      setAddress(address);
      
      // Vérification du rôle
      const isAdmin = adminAddresses.includes(address);
      setUserRole(isAdmin ? 'admin' : 'user');
      
      setSuccess(`Connecté en tant que ${isAdmin ? 'administrateur' : 'utilisateur'}`);
    } catch (err) {
      setError("Erreur de connexion: " + err.message);
    }
  };    const handleDisconnect = async () => {
    try {
      await window.petra.disconnect();
      setAddress("");
      setUserRole(null);
      setSuccess("Déconnecté avec succès");
    } catch (err) {
      setError("Erreur de déconnexion: " + err.message);
    }
  };

  // Ajouter un produit pharmaceutique
  const handleAddProduct = async () => {
    // Vérifier les permissions
    if (!checkPermission('admin')) {
      setError("Permission refusée : Seuls les administrateurs peuvent ajouter des produits");
      return;
    }

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
    setSuccess("");
    
    try {
      // Créer description enrichie avec les données pharmaceutiques
      const enrichedDescription = `${description} | Fournisseur: ${supplier} | Lot: ${batchNumber}`;
      
      const hash = await addProduct(name, category, enrichedDescription, window.petra);
      setTxHash(hash);
      setSuccess(`✅ Produit "${name}" certifié avec succès !`);

      // Ajouter à la liste locale (simulation)
      const newProduct = {
        id: (productsList.length + 1).toString(),
        name,
        category,
        supplier,
        batchNumber,
        description,
        arrival_date: Math.floor(Date.now() / 1000),
        status: "certified"
      };
      setProductsList(prev => [newProduct, ...prev]);

      // Créer une notification
      notificationManager.notifyNewProduct({
        name,
        category,
        supplier,
        batchNumber
      });

      // Reset form
      setName("");
      setCategory("principe-actif");
      setDescription("");
      setSupplier("");
      setBatchNumber("");
      
      // Retour au dashboard après ajout
      setTimeout(() => setCurrentView("dashboard"), 2000);
    } catch (err) {
      setError("Erreur lors de l'ajout: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lire un produit spécifique
  const handleGetProduct = async () => {
    if (!address) {
      setError("Veuillez d'abord connecter votre wallet pour obtenir l'adresse");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setProductData(null);

    try {
      const result = await getProduct(address, parseInt(productIdToSearch));
      setProductData(result);
      setSuccess(`Produit #${productIdToSearch} récupéré de la blockchain`);
    } catch (err) {
      setError("Erreur lors de la récupération: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les produits
  const getFilteredProducts = () => {
    let filtered = productsList;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(product => 
        // Recherche par ID (conversion en string pour la comparaison)
        (product.id?.toString() || '').includes(searchTerm) ||
        // Recherche par nom, description et catégorie
        (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (product.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) 
      );
    }

    // Filtre par catégorie
    if (filterCategory !== "all") {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Tri
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "newest": return b.arrival_date - a.arrival_date;
        case "oldest": return a.arrival_date - b.arrival_date;
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return filtered;
  };

  // Statistiques dashboard
  const getStats = () => {
    const total = productsList.length;
    const certified = total; // tout est certifié
    const today = productsList.filter(p => {
      const productDate = new Date(p.arrival_date * 1000);
      const todayDate = new Date();
      return productDate.toDateString() === todayDate.toDateString();
    }).length;

    return { total, certified, today };
  };

  const stats = getStats();

  // Vérification des permissions
  const checkPermission = (requiredRole) => {
    if (!address) return false;
    if (requiredRole === 'admin' && userRole !== 'admin') return false;
    return true;
  };

  // Obtenir la couleur de la catégorie
  const getCategoryColor = (catValue) => {
    const cat = categories.find(c => c.value === catValue);
    return cat ? cat.color : "#64748b";
  };  // Formater la date d'arrivée
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Header */}
      <header className="pharma-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo">🏥</span>
            <h1>PharmaCert</h1>
            <span className="subtitle">Certification Blockchain Pharmaceutique</span>
          </div>
          
          {/* Navigation */}
          <nav className="main-nav">
            <button 
              className={currentView === "dashboard" ? "nav-btn active" : "nav-btn"}
              onClick={() => setCurrentView("dashboard")}
            >
              🏠 Dashboard
            </button>
            {userRole === 'admin' && (
              <button 
                className={currentView === "add" ? "nav-btn active" : "nav-btn"}
                onClick={() => setCurrentView("add")}
              >
                ➕ Ajouter
              </button>
            )}
            <button 
              className={currentView === "list" ? "nav-btn active" : "nav-btn"}
              onClick={() => setCurrentView("list")}
            >
              📋 Produits
            </button>

            {userRole === 'admin' && (
              <button 
                className={currentView === "admin" ? "nav-btn active" : "nav-btn"}
                onClick={() => setCurrentView("admin")}
              >
                👑 Administration
              </button>
            )}
          </nav>
          
          {/* Connexion wallet */}
          <div className="wallet-section">
            {address && (
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onNotificationClick={(id) => {
                  notificationManager.markAsRead(id);
                  setUnreadCount(notificationManager.getUnreadCount());
                }}
              />
            )}
            {address ? (
              <div className="wallet-connected">
                <div className="wallet-info">
                  <span className={`wallet-label ${userRole}`}>
                    <span className={`role-badge ${userRole}`}>
                      {userRole === 'admin' ? '👑 ADMIN' : '👤 USER'}
                    </span>
                  </span>
                  <span className="wallet-address">
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </span>
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
        {/* Messages */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
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
                  {/* Statut en attente supprimé: tout est certifié à l'ajout */}
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
                    <div className="stat-label">Produits Total</div>
                  </div>
                  <div className="stat-card certified">
                    <div className="stat-value">{stats.certified}</div>
                    <div className="stat-label">Certifiés</div>
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
        )}

        {/* ADD PRODUCT VIEW */}
        {currentView === "add" && (
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
        )}

        {/* PRODUCTS LIST VIEW */}
        {currentView === "list" && (
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                          onClick={() => {
                            generateProductPDF(product, categories)
                              .then(() => {
                                toast.success("PDF généré avec succès");
                              })
                              .catch((error) => {
                                toast.error("Erreur lors de la génération du PDF");
                                console.error(error);
                              });
                          }}
                        >
                          📄 Exporter PDF
                        </button>
                        
                      </div>
                    )}
                  </div>
                </div>
              ))}              {getFilteredProducts().length === 0 && (
                <div className="no-results">
                  <span className="no-results-icon">🔍</span>
                  <h3>Aucun produit trouvé</h3>
                  <p>Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          </section>
        )}



        {/* Résultat transaction */}
                {currentView === "admin" && userRole === "admin" && (
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
                      onClick={() => {
                        if (newAdminAddress) {
                          setAdminList([...adminList, { 
                            address: newAdminAddress, 
                            dateAdded: Date.now() 
                          }]);
                          setNewAdminAddress("");
                          setSuccess("Administrateur ajouté avec succès");
                        }
                      }}
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
                          onClick={() => {
                            setAdminList(adminList.filter((_, i) => i !== index));
                            setSuccess("Administrateur retiré avec succès");
                          }}
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
        )}

        {txHash && (
          <section className="result-section success">
            <h3>🔗 Transaction Blockchain</h3>
            <p>
              Hash de la transaction :{" "}
              <a
                href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                {txHash.slice(0, 20)}...
              </a>
            </p>
          </section>
        )}

        {/* Résultat produit blockchain */}
        {productData && (
          <section className="result-section">
            <h3 className="result-title">
              <span className="result-icon">📄</span>
              Derniers Produits
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
          </section>
        )}
      </main>
    </div>
  );
}

export default App;