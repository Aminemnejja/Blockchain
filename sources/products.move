module products_contract::registry {

    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::timestamp;

    struct Product has copy, drop, store {
        id: u64,
        name: string::String,
        category: string::String,
        description: string::String,
        arrival_date: u64,
    }

    struct ProductRegistry has key {
        products: vector<Product>,
        last_id: u64,
    }

    // Init à l'adresse du deployer
    public entry fun init(account: &signer) {
        move_to(account, ProductRegistry { products: vector::empty<Product>(), last_id: 0 });
    }

    // Ajout de produit par n'importe quel utilisateur
    public entry fun add_product(
        user: &signer,
        name: string::String,
        category: string::String,
        description: string::String
    ) acquires ProductRegistry {
        let deployer_addr = @products_contract;
        let registry = borrow_global_mut<ProductRegistry>(deployer_addr);
        let new_id = registry.last_id + 1;
        let ts = timestamp::now_seconds();

        let product = Product {
            id: new_id,
            name,
            category,
            description,
            arrival_date: ts,
        };

        vector::push_back(&mut registry.products, product);
        registry.last_id = new_id;
    }

    public fun get_product(account: address, id: u64): Product acquires ProductRegistry {
        let registry = borrow_global<ProductRegistry>(account);
        let products_ref = &registry.products;
        let len = vector::length(products_ref);

        let i = 0;
        while (i < len) {
            let p_ref = vector::borrow(products_ref, i);
            if (p_ref.id == id) {
                return *p_ref;
            };
            i = i + 1;
        };
        abort 1
    }

    public entry fun get_product_entry(account: &signer, id: u64) acquires ProductRegistry {
        let product = get_product(signer::address_of(account), id);
    }

    // Fonction pour réinitialiser le registre (vider tous les produits)
    public entry fun reset_registry(account: &signer) acquires ProductRegistry {
        let deployer_addr = @products_contract;
        let registry = borrow_global_mut<ProductRegistry>(deployer_addr);
        
        // Vider le vecteur de produits en supprimant tous les éléments
        let len = vector::length(&registry.products);
        let i = 0;
        while (i < len) {
            vector::pop_back(&mut registry.products);
            i = i + 1;
        };
        registry.last_id = 0;
    }

    // Fonction pour obtenir tous les produits
    public fun get_all_products(): vector<Product> acquires ProductRegistry {
        let deployer_addr = @products_contract;
        let registry = borrow_global<ProductRegistry>(deployer_addr);
        registry.products
    }

    // Fonction pour obtenir le nombre total de produits
    public fun get_products_count(): u64 acquires ProductRegistry {
        let deployer_addr = @products_contract;
        let registry = borrow_global<ProductRegistry>(deployer_addr);
        vector::length(&registry.products)
    }
}