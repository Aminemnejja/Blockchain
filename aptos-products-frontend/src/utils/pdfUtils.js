import React from 'react';
import { pdf } from '@react-pdf/renderer';
import ProductPDF from '../components/ProductPDF';

export const generateProductPDF = async (product, categories) => {
  try {
    // Générer un lien d'exploration blockchain (même sans txHash)
    const explorerLink = product.txHash 
      ? `https://explorer.aptoslabs.com/txn/${product.txHash}?network=testnet`
      : `https://explorer.aptoslabs.com/?network=testnet`;
    
    console.log('Génération PDF pour:', product);
    
    // Création du document PDF avec React.createElement
    const blob = await pdf(
      React.createElement(ProductPDF, {
        product,
        categories,
        explorerLink
      })
    ).toBlob();
    
    // Création d'une URL pour le blob
    const url = URL.createObjectURL(blob);
    
    // Création d'un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `PharmaCert-${product.name.replace(/[^a-zA-Z0-9]/g, '_')}-${product.id}.pdf`;
    
    // Simulation du clic pour démarrer le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyage de l'URL
    URL.revokeObjectURL(url);
    
    console.log('PDF généré avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};