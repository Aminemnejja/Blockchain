// src/aptosClient.js
import { AptosClient } from "aptos";

// URL du fullnode devnet Aptos
const NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";

export const client = new AptosClient(NODE_URL);

// Fonction pour se connecter à Petra Wallet
export async function connectWallet() {
  if (!window.petra) {
    alert("Petra Wallet non installé !");
    return null;
  }
  await window.petra.connect();
  const account = await window.petra.account();
  return account.address;
}

// Déconnecter Petra
export async function disconnectWallet() {
  if (window.petra) await window.petra.disconnect();
}
