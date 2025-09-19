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

    public entry fun init(account: &signer) {
        move_to(account, ProductRegistry { products: vector::empty<Product>(), last_id: 0 });
    }

    public entry fun add_product(
        account: &signer,
        name: string::String,
        category: string::String,
        description: string::String
    ) acquires ProductRegistry {
        let registry = borrow_global_mut<ProductRegistry>(signer::address_of(account));
        let new_id = registry.last_id + 1;
        let timestamp = timestamp::now_seconds();

        let product = Product {
            id: new_id,
            name,
            category,
            description,
            arrival_date: timestamp,
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
            return *p_ref; // on retourne une COPIE, pas une référence
        };
        i = i + 1;
    };
    abort 1 // Produit non trouvé
}

    // ✅ Nouvelle fonction entry pour tester get_product
 public entry fun get_product_entry(account: &signer, id: u64) acquires ProductRegistry {
        let product = get_product(signer::address_of(account), id);
        // Ici tu pourrais émettre un event ou juste "toucher" product pour test
    }
}
