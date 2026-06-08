CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(19, 2) NOT NULL,
    discription VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    availability INT NOT NULL,
    image_url VARCHAR(255)
);
