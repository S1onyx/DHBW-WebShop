INSERT INTO users (first_name, last_name, username, email, password_hash, role_id, status_id, street, house_number, postal_code, city, country) VALUES
-- Admins (Admin123!)
('Elena', 'Bauer', 'admin3', 'admin3@example.com', '$2b$10$yFqwdVK5p4j/OXRrcCCUv.wHQIs8N6eH5H7NgQpCtUwNzBGG.G3jy', 1, 2, 'Zentralallee', '3', '10003', 'Kontrollingen', 'Switzerland'),
('Lena', 'Mayer', 'admin1', 'admin1@example.com', '$2b$10$yFqwdVK5p4j/OXRrcCCUv.wHQIs8N6eH5H7NgQpCtUwNzBGG.G3jy', 1, 1, 'Adminstrasse', '1', '10001', 'Adminstadt', 'Germany'),
('Markus', 'Schulz', 'admin2', 'admin2@example.com', '$2b$10$yFqwdVK5p4j/OXRrcCCUv.wHQIs8N6eH5H7NgQpCtUwNzBGG.G3jy', 1, 1, 'Leiterweg', '2', '10002', 'Verwaltungsburg', 'Austria'),
('Jan', 'Koch', 'admin4', 'admin4@example.com', '$2b$10$yFqwdVK5p4j/OXRrcCCUv.wHQIs8N6eH5H7NgQpCtUwNzBGG.G3jy', 1, 1, 'Technikgasse', '4', '10004', 'ITstadt', 'Liechtenstein'),
('Sarah', 'Fischer', 'admin5', 'admin5@example.com', '$2b$10$yFqwdVK5p4j/OXRrcCCUv.wHQIs8N6eH5H7NgQpCtUwNzBGG.G3jy', 1, 1, 'Serverweg', '5', '10005', 'Adminpolis', 'Germany'),

-- Sellers (Seller123!)
('Stefan', 'Hartmann', 'seller3', 'seller3@example.com', '$2b$10$kOQx94MIPoUxD6fuCVTZKehXY.3fQZPuf9lUp5FXOJWZK9gExi1rO', 2, 2, 'Handelsallee', '12', '20003', 'Tradeburg', 'Luxembourg'),
('Tom', 'Brandt', 'seller1', 'seller1@example.com', '$2b$10$kOQx94MIPoUxD6fuCVTZKehXY.3fQZPuf9lUp5FXOJWZK9gExi1rO', 2, 1, 'Marktstrasse', '10', '20001', 'Verkaufshafen', 'Netherlands'),
('Anna', 'Neumann', 'seller2', 'seller2@example.com', '$2b$10$kOQx94MIPoUxD6fuCVTZKehXY.3fQZPuf9lUp5FXOJWZK9gExi1rO', 2, 1, 'Shopweg', '11', '20002', 'Käuferdorf', 'Belgium'),
('Julia', 'Krüger', 'seller4', 'seller4@example.com', '$2b$10$kOQx94MIPoUxD6fuCVTZKehXY.3fQZPuf9lUp5FXOJWZK9gExi1rO', 2, 1, 'Ladenstrasse', '13', '20004', 'Kaufland', 'France'),
('Matthias', 'Zimmer', 'seller5', 'seller5@example.com', '$2b$10$kOQx94MIPoUxD6fuCVTZKehXY.3fQZPuf9lUp5FXOJWZK9gExi1rO', 2, 1, 'Shopperallee', '14', '20005', 'Produktfurt', 'Spain'),

-- Customers (Customer123!)
('Nina', 'Hoffmann', 'customer4', 'customer4@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 2, 'Talweg', '24', '30004', 'Bergstadt', 'Liechtenstein'),
('Paul', 'Winter', 'customer1', 'customer1@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Birkenweg', '21', '30001', 'Waldstadt', 'Germany'),
('Lisa', 'Sommer', 'customer2', 'customer2@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Blumenallee', '22', '30002', 'Gartendorf', 'Austria'),
('Felix', 'Becker', 'customer3', 'customer3@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Wiesenstrasse', '23', '30003', 'Feldhausen', 'Switzerland'),
('Tobias', 'Lang', 'customer5', 'customer5@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Hauptgasse', '25', '30005', 'Hauptstadt', 'Germany'),
('Clara', 'Wagner', 'customer6', 'customer6@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Seestrasse', '26', '30006', 'Seeblick', 'Austria'),
('Leon', 'Schneider', 'customer7', 'customer7@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Waldweg', '27', '30007', 'Forstheim', 'Germany'),
('Mia', 'Weber', 'customer8', 'customer8@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Feldweg', '28', '30008', 'Grünhausen', 'Germany'),
('Jonas', 'Wolf', 'customer9', 'customer9@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Gartenstrasse', '29', '30009', 'Blumental', 'Austria'),
('Emma', 'Klein', 'customer10', 'customer10@example.com', '$2b$10$V9Hv9yDN3e5CV2BcgqZf4.Hl01vuEyJXJBTpdazjLS7XZjJbZLNy2', 3, 1, 'Bergweg', '30', '30010', 'Alpendorf', 'Switzerland');
