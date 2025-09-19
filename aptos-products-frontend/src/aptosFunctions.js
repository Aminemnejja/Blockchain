// src/aptosFunctions.js
import { client } from "./aptosClient";

// Adresse du module publié
const MODULE_ADDRESS = "0x6c940c3205cb7d3b40a2fbb4e550aabaf7a13bb3f92465ac2fe4b31bbd664e02";
const MODULE_NAME = "registry";

// Ajouter un produit
export async function addProduct(name, category, description, signer) {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::add_product`,
      type_arguments: [],
      arguments: [name, category, description],
    };

    const tx = await signer.signAndSubmitTransaction(payload);
    await client.waitForTransaction(tx.hash);
    return tx.hash;
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    throw error;
  }
}

// Récupérer un produit en lisant directement la resource
export async function getProduct(userAddress, id) {
  try {
    console.log("Trying to read resource for address:", userAddress);
    
    // Essayer de lire la resource Registry directement
    const resource = await client.getAccountResource(
      userAddress,
      `${MODULE_ADDRESS}::${MODULE_NAME}::Registry`
    );
    
    console.log("Registry resource:", resource);
    return resource;
  } catch (error) {
    console.error("Erreur lors de la lecture de la resource:", error);
    
    // Si la resource n'existe pas, essayer une autre approche
    try {
      console.log("Trying alternative resource name...");
      const altResource = await client.getAccountResource(
        userAddress,
        `${MODULE_ADDRESS}::${MODULE_NAME}::ProductRegistry`
      );
      return altResource;
    } catch (altError) {
      console.error("Alternative resource also failed:", altError);
      throw new Error(`Impossible de lire les données: ${error.message}`);
    }
  }
}

// Alternative : Lire les événements pour trouver les produits
export async function getProductEvents(userAddress) {
  try {
    console.log("Reading events for address:", userAddress);
    
    const events = await client.getEventsByEventHandle(
      userAddress,
      `${MODULE_ADDRESS}::${MODULE_NAME}::Registry`,
      "add_product_events"
    );
    
    return events;
  } catch (error) {
    console.error("Erreur lors de la lecture des événements:", error);
    throw error;
  }
}

// Debug: Lister toutes les resources disponibles sur le compte
export async function listAccountResources(userAddress) {
  try {
    console.log("Listing all resources for address:", userAddress);
    
    const account = await client.getAccount(userAddress);
    const resources = await client.getAccountResources(userAddress);
    
    console.log("Account info:", account);
    console.log("All resources:", resources);
    
    return resources;
  } catch (error) {
    console.error("Erreur lors de la lecture des resources:", error);
    throw error;
  }
}