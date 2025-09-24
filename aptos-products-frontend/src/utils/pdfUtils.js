import { pdf } from '@react-pdf/renderer';
import ProductPDF from '../components/ProductPDF';

export const generateProductPDF = async (product, categories) => {
  const explorerLink = `https://explorer.aptoslabs.com/txn/${product.txHash}?network=testnet`;
  
  // Création du document PDF
  const blob = await pdf(
    ProductPDF({ product, categories, explorerLink })
  ).toBlob();
  
  // Création d'une URL pour le blob
  const url = URL.createObjectURL(blob);
  
  // Création d'un lien temporaire pour le téléchargement
  const link = document.createElement('a');
  link.href = url;
  link.download = `PharmaCert-${product.name}-${product.id}.pdf`;
  
  // Simulation du clic pour démarrer le téléchargement
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Nettoyage de l'URL
  URL.revokeObjectURL(url);
};