require('dotenv').config();
const mysql = require('mysql2/promise');

const categoryMap = {
  Fashion: new Set([
    'mens-shirts',
    'mens-shoes',
    'mens-watches',
    'sunglasses',
    'tops',
    'womens-bags',
    'womens-dresses',
    'womens-jewellery',
    'womens-shoes',
    'womens-watches'
  ]),
  Electronics: new Set(['laptops', 'mobile-accessories', 'smartphones', 'tablets']),
  Accessories: new Set([
    'beauty',
    'fragrances',
    'motorcycle',
    'skin-care',
    'sports-accessories',
    'vehicle'
  ]),
  Home: new Set(['furniture', 'groceries', 'home-decoration', 'kitchen-accessories'])
};

async function loadCatalog() {
  const response = await fetch(
    'https://dummyjson.com/products?limit=0&select=title,category,thumbnail,images,description,price,stock'
  );
  if (!response.ok) throw new Error(`Could not load product photos (HTTP ${response.status}).`);

  const { products: sourceProducts } = await response.json();
  if (!Array.isArray(sourceProducts)) throw new Error('Product photo catalog returned invalid data.');

  const catalog = sourceProducts.flatMap(product => {
    const category = Object.entries(categoryMap)
      .find(([, sourceCategories]) => sourceCategories.has(product.category))?.[0];
    const image = product.images?.[0] || product.thumbnail;
    if (!category || !image || !Number.isFinite(product.price) || product.price <= 0) return [];
    return [{
      name: product.title.trim(),
      description: product.description || `${product.title}, selected for everyday use.`,
      category,
      price: Math.round(product.price * 85),
      image,
      stock: Math.max(0, Number(product.stock) || 0)
    }];
  });

  const names = new Set();
  const uniqueCatalog = catalog.filter(product => {
    const key = product.name.toLocaleLowerCase();
    if (names.has(key)) return false;
    names.add(key);
    return true;
  });
  const images = new Set(catalog.map(product => product.image));
  if (uniqueCatalog.length < 100 || images.size !== catalog.length) {
    throw new Error('Catalog must contain at least 100 products with unique names and photos.');
  }
  for (const product of uniqueCatalog) {
    if (product.name.length > 180 || !product.description ||
        !product.image.startsWith('https://cdn.dummyjson.com/product-images/')) {
      throw new Error(`Invalid product details or image URL for "${product.name}".`);
    }
  }
  return uniqueCatalog;
}

async function seedCatalog() {
  const products = await loadCatalog();
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shopease'
  });

  try {
    await db.beginTransaction();
    await db.query('SELECT id FROM products FOR UPDATE');
    const [[references]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id=oi.product_id) AS order_refs,
         (SELECT COUNT(*) FROM cart_items ci JOIN products p ON p.id=ci.product_id) AS cart_refs`
    );
    if (references.order_refs || references.cart_refs) {
      throw new Error(
        `Catalog refresh stopped: ${references.order_refs} order items and ${references.cart_refs} cart items reference current products.`
      );
    }

    await db.query('DELETE FROM products');
    await db.query(
      `INSERT INTO products(name,description,category,price,image_url,stock)
       VALUES ?`,
      [products.map(product => [
        product.name,
        product.description,
        product.category,
        product.price,
        product.image,
        product.stock
      ])]
    );
    await db.commit();

    const [[index]] = await db.query(
      `SELECT COUNT(*) AS total FROM information_schema.statistics
       WHERE table_schema=DATABASE() AND table_name='products' AND column_name='name' AND non_unique=0`
    );
    if (!index.total) {
      await db.query('ALTER TABLE products ADD UNIQUE KEY products_name_unique (name)');
    }
    console.log(`Seeded ${products.length} unique products with real product photos.`);
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}

seedCatalog().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
