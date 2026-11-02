USE shopease;

INSERT INTO products (name,description,category,price,image_url,stock)
SELECT catalog.name,catalog.description,catalog.category,catalog.price,catalog.image_url,catalog.stock
FROM (
  SELECT
    CONCAT(editions.edition,' ',families.family_name) AS name,
    CONCAT('A thoughtfully designed ',LOWER(editions.edition),' ',LOWER(families.family_name),' made for comfort, quality and everyday use.') AS description,
    families.category AS category,
    families.base_price + editions.edition_number * families.price_step AS price,
    families.image_url AS image_url,
    8 + MOD(editions.edition_number + families.family_number * 3, 35) AS stock
  FROM (
    SELECT 0 AS edition_number,'Aurora' AS edition UNION ALL
    SELECT 1,'Urban' UNION ALL
    SELECT 2,'Everyday' UNION ALL
    SELECT 3,'Coastal' UNION ALL
    SELECT 4,'Studio' UNION ALL
    SELECT 5,'Weekend' UNION ALL
    SELECT 6,'Essential' UNION ALL
    SELECT 7,'Luxe' UNION ALL
    SELECT 8,'Active' UNION ALL
    SELECT 9,'Sunrise'
  ) AS editions
  CROSS JOIN (
    SELECT 0 AS family_number,'Classic Sneakers' AS family_name,'Fashion' AS category,2499 AS base_price,125 AS price_step,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700' AS image_url UNION ALL
    SELECT 1,'Cotton T-Shirt','Fashion',799,50,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700' UNION ALL
    SELECT 2,'Comfort Hoodie','Fashion',1599,100,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700' UNION ALL
    SELECT 3,'Wireless Headphones','Electronics',3299,150,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700' UNION ALL
    SELECT 4,'Smart Watch','Electronics',4599,200,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700' UNION ALL
    SELECT 5,'Bluetooth Speaker','Electronics',1899,100,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700' UNION ALL
    SELECT 6,'Travel Backpack','Accessories',1799,100,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700' UNION ALL
    SELECT 7,'Everyday Sunglasses','Accessories',999,75,'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700' UNION ALL
    SELECT 8,'Minimal Desk Lamp','Home',1299,75,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700' UNION ALL
    SELECT 9,'Insulated Water Bottle','Home',699,50,'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700'
  ) AS families
) AS catalog
WHERE NOT EXISTS (
  SELECT 1 FROM products existing WHERE existing.name=catalog.name
);
