import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import Logo from './Logo';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
  },
  productInfo: {
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 150,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
  },
  verificationLink: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  link: {
    color: '#0ea5e9',
    fontSize: 10,
    textDecoration: 'underline',
  },
  linkLabel: {
    fontSize: 10,
    marginTop: 5,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  categoryBadge: {
    padding: 5,
    borderRadius: 4,
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    width: 100,
  },
});

// Composant principal du PDF
const ProductPDF = ({ product, categories, explorerLink }) => {
  const getCategoryColor = (catValue) => {
    const cat = categories.find(c => c.value === catValue);
    return cat ? cat.color : "#64748b";
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PharmaCert</Text>
            <Text style={styles.subtitle}>Certification Blockchain Pharmaceutique</Text>
          </View>
          {/* Logo pourrait être ajouté ici */}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID Produit:</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>#{product.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{product.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Catégorie:</Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(product.category) }]}>
              <Text style={{ color: 'white' }}>
                {categories.find(c => c.value === product.category)?.label || product.category}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fournisseur:</Text>
            <Text style={styles.value}>{product.supplier}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Numéro de lot:</Text>
            <Text style={styles.value}>{product.batchNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Date d'arrivée:</Text>
            <Text style={styles.value}>{formatDate(product.arrival_date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{product.description}</Text>
          </View>

          <View style={styles.verificationLink}>
            <Text style={styles.link}>{explorerLink}</Text>
            <Text style={styles.linkLabel}>
              Lien de vérification blockchain
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Document généré le {new Date().toLocaleString('fr-FR')}</Text>
          <Text>Certifié par PharmaCert sur la blockchain Aptos</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProductPDF;