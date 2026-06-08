-- Clear existing to ensure fresh start
DELETE FROM users WHERE user_name = 'admin' OR user_name = 'john_doe';
DELETE FROM users_details WHERE email = 'admin@rainbowforest.com' OR email = 'john@example.com';
DELETE FROM user_role WHERE id IN (1, 2);

INSERT INTO user_role (id, role_name) VALUES (1, 'ROLE_USER'), (2, 'ROLE_ADMIN');

INSERT INTO users_details (id, first_name, last_name, email, phone_number, country) VALUES 
(1, 'John', 'Doe', 'john@example.com', '123456789', 'Vietnam'),
(2, 'Admin', 'User', 'admin@rainbowforest.com', '000000000', 'Vietnam');

INSERT INTO users (id, user_name, user_password, active, user_details_id, role_id) VALUES 
(1, 'john_doe', 'password123', 1, 1, 1),
(2, 'admin', 'admin', 1, 2, 2);
