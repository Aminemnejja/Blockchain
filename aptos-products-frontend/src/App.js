// src/App.js - ÉTAPE 2: Fonctionnalités avancées PharmaCert
import React, { useState, useEffect } from "react";
import { addProduct, getProduct, getAllProducts } from "./aptosFunctions";
import { generateProductPDF } from "./utils/pdfUtils";
import { ToastContainer, toast } from 'react-toastify';
import notificationManager from './utils/notificationManager';
import 'react-toastify/dist/ReactToastify.css';
import "./pharma-styles.css";

// Import des nouveaux composants
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddProduct from './components/AddProduct';
import ProductListWrapper from './components/ProductListWrapper';
import AdminPanel from './components/AdminPanel';
import AuditTrail from './components/AuditTrail';

// Import du système d'audit trail
import auditTrailManager from './utils/auditTrail';

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
    "0x6c940c3205cb7d3b40a2fbb4e550aabaf7a13bb3f92465ac2fe4b31bbd664e02", 
    "0x207ba9b3b269a8da9d9c75a7f21f76ae9c777b6061de4a7b87e6f2c55aa03e07", // Adresse admin principale
  ];  // Connexion wallet
  const handleConnect = async () => {
    try {
      const { address } = await window.petra.connect();
      setAddress(address);
      
      // Vérification du rôle
      const isAdmin = adminAddresses.includes(address);
      setUserRole(isAdmin ? 'admin' : 'user');
      
      // Log d'audit pour la connexion
      auditTrailManager.logUserLogin(address, isAdmin ? 'admin' : 'user');
      
      setSuccess(`Connecté en tant que ${isAdmin ? 'administrateur' : 'utilisateur'}`);
    } catch (err) {
      setError("Erreur de connexion: " + err.message);
      // Log d'erreur d'audit
      auditTrailManager.logSystemError(address || 'unknown', userRole || 'unknown', err, 'wallet_connection');
    }
  };    const handleDisconnect = async () => {
    try {
      // Log d'audit pour la déconnexion
      auditTrailManager.logUserLogout(address, userRole);
      
      await window.petra.disconnect();
      setAddress("");
      setUserRole(null);
      setSuccess("Déconnecté avec succès");
    } catch (err) {
      setError("Erreur de déconnexion: " + err.message);
      // Log d'erreur d'audit
      auditTrailManager.logSystemError(address || 'unknown', userRole || 'unknown', err, 'wallet_disconnection');
    }
  };

  // Ajouter un produit pharmaceutique
  const handleAddProduct = async () => {
    // Vérifier les permissions
    if (!checkPermission('admin')) {
      // Log d'audit pour permission refusée
      auditTrailManager.logPermissionDenied(address, userRole, 'add_product');
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

      // Log d'audit pour l'ajout de produit
      auditTrailManager.logProductAdded(address, userRole, newProduct);

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
      // Log d'erreur d'audit
      auditTrailManager.logSystemError(address, userRole, err, 'product_addition');
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
      
      <Header
        address={address}
        userRole={userRole}
        currentView={currentView}
        setCurrentView={setCurrentView}
        handleConnect={handleConnect}
        handleDisconnect={handleDisconnect}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationClick={(id) => {
          notificationManager.markAsRead(id);
          setUnreadCount(notificationManager.getUnreadCount());
        }}
      />

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
          <Dashboard
            userRole={userRole}
            productsList={productsList}
            stats={stats}
            getCategoryColor={getCategoryColor}
            formatArrivalDate={formatArrivalDate}
          />
        )}

        {/* ADD PRODUCT VIEW */}
        {currentView === "add" && (
          <AddProduct
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
            description={description}
            setDescription={setDescription}
            supplier={supplier}
            setSupplier={setSupplier}
            batchNumber={batchNumber}
            setBatchNumber={setBatchNumber}
            categories={categories}
            getCategoryColor={getCategoryColor}
            handleAddProduct={handleAddProduct}
            loading={loading}
            address={address}
          />
        )}

        {/* PRODUCTS LIST VIEW */}
        {currentView === "list" && (
          <ProductListWrapper
            productsList={productsList}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            getFilteredProducts={getFilteredProducts}
            getCategoryColor={getCategoryColor}
            formatArrivalDate={formatArrivalDate}
            userRole={userRole}
            categories={categories}
            userId={address}
          />
        )}



        {/* ADMIN PANEL */}
        {currentView === "admin" && userRole === "admin" && (
          <>
            <AdminPanel
              newAdminAddress={newAdminAddress}
              setNewAdminAddress={setNewAdminAddress}
              adminList={adminList}
              setAdminList={setAdminList}
              address={address}
              setSuccess={setSuccess}
              userRole={userRole}
            />
            
            {/* Audit Trail pour les admins */}
            <AuditTrail
              userId={address}
              userRole={userRole}
            />
          </>
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