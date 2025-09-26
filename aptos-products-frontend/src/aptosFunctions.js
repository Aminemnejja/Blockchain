// src/aptosFunctions.js
import { client } from "./aptosClient";

// Adresse du module publié
const MODULE_ADDRESS = "0x6c940c3205cb7d3b40a2fbb4e550aabaf7a13bb3f92465ac2fe4b31bbd664e02";
const MODULE_NAME = "registry";

// Ajouter un produit (en attente par défaut)
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
};

// Approuver un produit
export async function approveProduct(productId, signer) {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::approve_product`,
      type_arguments: [],
      arguments: [productId],
    };

    const tx = await signer.signAndSubmitTransaction(payload);
    await client.waitForTransaction(tx.hash);
    return tx.hash;
  } catch (error) {
    console.error("Erreur lors de l'approbation du produit:", error);
    throw error;
  }
};

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

// Récupérer tous les produits depuis la resource ProductRegistry (fallback sur plusieurs formes)
export async function getAllProducts(userAddress = MODULE_ADDRESS) {
  try {
    console.log("getAllProducts: reading registry for", userAddress);

    // Essayer les noms probables de la resource
    let res = null;
    try {
      res = await client.getAccountResource(
        userAddress,
        `${MODULE_ADDRESS}::${MODULE_NAME}::ProductRegistry`
      );
    } catch (_) {
      try {
        res = await client.getAccountResource(
          userAddress,
          `${MODULE_ADDRESS}::${MODULE_NAME}::Registry`
        );
      } catch (__) {
        // ignore, on essaiera la liste complète
      }
    }

    if (!res) {
      const resources = await client.getAccountResources(userAddress);
      res = resources.find(r => r.type && (r.type.endsWith(`${MODULE_NAME}::ProductRegistry`) || r.type.endsWith(`${MODULE_NAME}::Registry`)));
    }

    if (!res) {
      console.warn("getAllProducts: registry resource not found for", userAddress);
      return [];
    }

    const data = res.data || res;
    const rawProducts = data.products || [];

    // Helper pour extraire une valeur de champ retourné par l'API
    const extract = (v) => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
      if (typeof v === 'object') {
        if ('value' in v) return v.value;
        if ('vec' in v) return v.vec;
        // parfois la lib renvoie directement les champs
        const keys = Object.keys(v);
        if (keys.length === 1) return v[keys[0]];
      }
      return v;
    };

    const products = rawProducts.map(p => {
      // p peut être soit un objet JS avec champs, soit une structure plus imbriquée
      const id = extract(p.id) ?? extract(p[0]) ?? undefined;
      const name = extract(p.name) ?? extract(p[1]) ?? '';
      const category = extract(p.category) ?? extract(p[2]) ?? '';
      const description = extract(p.description) ?? extract(p[3]) ?? '';
      const arrival = extract(p.arrival_date) ?? extract(p[4]) ?? 0;

      return {
        id: id !== undefined ? String(id) : undefined,
        name: String(name || ''),
        category: String(category || ''),
        description: String(description || ''),
        arrival_date: Number(arrival || 0),
        // Frontend logic: tout produit ajouté par admin est considéré certifié
        status: 'certified'
      };
    });

    console.log("getAllProducts: parsed products", products);
    return products;
  } catch (error) {
    console.error("getAllProducts error:", error);
    throw error;
  }
};