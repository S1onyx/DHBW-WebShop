-- Hauptkategorien
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Animals', NULL),
(2, 'Art', NULL),
(3, 'Gaming', NULL),
(4, 'Nature', NULL),
(5, 'Urban', NULL),

-- Unterkategorien für Animals
(6, 'Cats', 1),
(7, 'Dogs', 1),
(8, 'Elephants', 1),
(9, 'Insects', 1),

-- Unterkategorien für Art
(10, 'Abstract', 2),

-- Unterkategorien für Gaming
(11, 'Donkeykong', 3),
(12, 'Mario', 3),
(13, 'Minecraft', 3),
(14, 'Pokemon', 3),
(15, 'Sonic', 3),
(16, 'Undertale', 3),

-- Unterkategorien für Nature
(17, 'Landscapes', 4),
(18, 'Ocean', 4),
(19, 'Sky', 4),

-- Unterkategorien für Urban
(20, 'Dystopian', 5),
(21, 'Futuristic', 5),
(22, 'Skylines', 5);