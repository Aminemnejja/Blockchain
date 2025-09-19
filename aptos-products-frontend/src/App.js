// src/App.js
import React, { useState } from "react";
import { connectWallet, disconnectWallet } from "./aptosClient";
import { addProduct, getProduct } from "./aptosFunctions"; // listAccountResources supprimé

function App() {
  const [address, setAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Nouveaux états pour le formulaire
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

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

  // Formulaire dynamique pour ajouter un produit
  const handleAddProduct = async () => {
    if (!window.petra) {
      setError("Petra Wallet non connecté");
      return;
    }

    if (!name || !category || !description) {
      setError("Tous les champs du formulaire sont obligatoires");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const hash = await addProduct(name, category, description, window.petra);
      setTxHash(hash);
      setError("");
      // Reset form
      setName("");
      setCategory("");
      setDescription("");
    } catch (err) {
      setError("Erreur lors de l'ajout: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetProduct = async () => {
    if (!address) {
      setError("Veuillez d'abord connecter votre wallet pour obtenir l'adresse");
      return;
    }

    setLoading(true);
    setError("");
    setProductData(null);
    
    try {
      // L'ID du produit est maintenant géré côté blockchain ou autre logique
      const result = await getProduct(address, 1); // Exemple avec ID par défaut ou généré automatiquement
      setProductData(result);
      setError("");
    } catch (err) {
      setError("Erreur lors de la récupération: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Aptos Products Frontend (Petra)</h2>

      {address ? (
        <>
          <p>Connected: {address}</p>
          <button onClick={handleDisconnect}>Disconnect Wallet</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect Petra Wallet</button>
      )}

      <hr />

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          Erreur: {error}
        </div>
      )}

      {/* Formulaire pour ajouter un produit */}
      <div style={{ marginBottom: 20 }}>
        <h3>Ajouter un nouveau produit</h3>
        <input
          type="text"
          placeholder="Nom du produit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={handleAddProduct} disabled={loading || !address}>
          {loading ? "Ajout..." : "Add Product"}
        </button>
      </div>

      {/* Bouton pour récupérer le produit */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleGetProduct} disabled={loading}>
          {loading ? "Récupération..." : "Get Product"}
        </button>
      </div>

      {txHash && (
        <p>Last Transaction Hash: <code>{txHash}</code></p>
      )}

      {productData && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
          <h3>Données du produit:</h3>
          <pre>{JSON.stringify(productData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
