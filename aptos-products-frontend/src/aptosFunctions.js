// src/aptosFunctions.js
import { client } from "./aptosClient";

// Adresse du module publié
const MODULE_ADDRESS = "0x6c940c3205cb7d3b40a2fbb4e550aabaf7a13bb3f92465ac2fe4b31bbd664e02";
const MODULE_NAME = "registry";

// Ajouter un produit
export async function addProduct(name, category, description, signer) {
  const payload = {
    type: "entry_function_payload",
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::add_product`,
    type_arguments: [],
    arguments: [name, category, description],
  };

  const tx = await signer.signAndSubmitTransaction(payload);
  await client.waitForTransaction(tx.hash);
  return tx.hash;
}

// Récupérer un produit via get_product_entry
export async function getProduct(id, signer) {
  const payload = {
    type: "entry_function_payload",
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_product_entry`,
    type_arguments: [],
    arguments: [id],
  };

  const tx = await signer.signAndSubmitTransaction(payload);
  await client.waitForTransaction(tx.hash);
  return tx.hash;
}
