// src/App.js
import React, { useState } from "react";
import { connectWallet, disconnectWallet } from "./aptosClient";
import { addProduct, getProduct } from "./aptosFunctions";

function App() {
  const [address, setAddress] = useState("");
  const [productId, setProductId] = useState(1);
  const [txHash, setTxHash] = useState("");

  const handleConnect = async () => {
    const addr = await connectWallet();
    if (addr) setAddress(addr);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setAddress("");
  };

  const handleAddProduct = async () => {
    const hash = await addProduct("PC", "Informatique", "Ordinateur portable", window.petra);
    setTxHash(hash);
  };

  const handleGetProduct = async () => {
    const hash = await getProduct(productId, window.petra);
    setTxHash(hash);
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
      <div>
        <button onClick={handleAddProduct}>Add Product</button>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <button onClick={handleGetProduct}>Get Product</button>
      </div>

      <p>Last Transaction Hash: {txHash}</p>
    </div>
  );
}

export default App;
