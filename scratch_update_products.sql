USE product_catalog;
SET NAMES utf8mb4;

UPDATE products SET 
  product_name='ROG Strix Gaming Laptop', 
  price=1499.99, 
  discription='Core i9, RTX 4080, 32GB RAM, 1TB SSD. Ultra-fast performance for gamers.', 
  category='Laptop', 
  image_url='https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80' 
WHERE id=1;

UPDATE products SET 
  product_name='MacBook Pro M3 Max', 
  price=2499.99, 
  discription='Apple M3 Max chip, 16-inch Liquid Retina XDR display, 36GB Unified Memory.', 
  category='Laptop', 
  image_url='https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' 
WHERE id=2;

UPDATE products SET 
  product_name='HP Spectre x360', 
  price=1299.99, 
  discription='Intel EVO Core i7, Touchscreen convertible, stunning OLED display.', 
  category='Laptop', 
  image_url='https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80' 
WHERE id=3;

UPDATE products SET 
  product_name='iPad Pro M4', 
  price=999.99, 
  discription='Ultra-thin design, Tandem OLED display, Apple M4 chip.', 
  category='Thiết bị điện tử', 
  image_url='https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80' 
WHERE id=4;

UPDATE products SET 
  product_name='PlayStation 5 Pro', 
  price=699.99, 
  discription='4K 120FPS gaming, Ray Tracing, 2TB SSD storage.', 
  category='Thiết bị điện tử', 
  image_url='https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80' 
WHERE id=5;

UPDATE products SET 
  product_name='Nintendo Switch OLED', 
  price=349.99, 
  discription='7-inch OLED screen, 64GB storage, versatile play modes.', 
  category='Thiết bị điện tử', 
  image_url='https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&q=80' 
WHERE id=6;

UPDATE products SET 
  product_name='Dell XPS 15', 
  price=1899.99, 
  discription='Intel Core i7, 16GB RAM, 512GB SSD, 15.6-inch OLED touchscreen.', 
  category='Laptop', 
  image_url='https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80' 
WHERE id=7;

UPDATE products SET 
  product_name='Sony WH-1000XM5', 
  price=399.99, 
  discription='Premium noise-canceling wireless headphones with industry-leading sound.', 
  category='Thiết bị điện tử', 
  image_url='https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80' 
WHERE id=8;

UPDATE products SET 
  product_name='Apple Watch Ultra 2', 
  price=799.99, 
  discription='Rugged titanium case, dual-frequency GPS, up to 36-hour battery life.', 
  category='Thiết bị điện tử', 
  image_url='https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80' 
WHERE id=9;
