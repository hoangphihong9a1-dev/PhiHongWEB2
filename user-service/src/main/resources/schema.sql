CREATE TABLE IF NOT EXISTS user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone_number VARCHAR(15),
    street VARCHAR(30),
    street_number VARCHAR(10),
    zip_code VARCHAR(6),
    locality VARCHAR(30),
    country VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    user_password VARCHAR(50) NOT NULL,
    active INT,
    user_details_id BIGINT,
    role_id BIGINT,
    FOREIGN KEY (user_details_id) REFERENCES users_details(id),
    FOREIGN KEY (role_id) REFERENCES user_role(id)
);
