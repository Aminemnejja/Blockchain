import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../aptosFunctions';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    

    const getStatusLabel = () => 'Certifié';

    const getStatusColor = () => 'green';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsList = await getAllProducts();
                setProducts(productsList);
            } catch (error) {
                console.error("Erreur lors de la récupération des produits:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Flux d'approbation supprimé: un produit ajouté par l'admin est certifié d'office

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="product-list">
            <h2>Liste des Produits</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td style={{ color: getStatusColor() }}>
                                {getStatusLabel()}
                            </td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;