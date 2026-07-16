INSERT IGNORE INTO user_role (id, role_name) VALUES (1, 'ROLE_USER'), (2, 'ROLE_ADMIN');

INSERT IGNORE INTO users_details (id, first_name, last_name, email, phone_number, country) VALUES 
(1, 'John', 'Doe', 'john@example.com', '123456789', 'Vietnam'),
(2, 'Admin', 'User', 'admin@rainbowforest.com', '000000000', 'Vietnam');

INSERT IGNORE INTO users (id, user_name, user_password, active, user_details_id, role_id) VALUES 
(1, 'john_doe', 'password123', 1, 1, 1),
(2, 'admin', 'admin', 1, 2, 2);
