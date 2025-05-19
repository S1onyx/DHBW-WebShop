-- Hauptkategorien
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Gaming', NULL),
(2, 'Nature', NULL),
(3, 'Fantasy', NULL),
(4, 'Urban', NULL),
(5, 'Animals', NULL),

-- Unterkategorien für Gaming
(6, 'Retro Games', 1),
(7, 'RPG Icons', 1),
(8, 'Game Characters', 1),

-- Unterkategorien für Nature
(9, 'Landscapes', 2),
(10, 'Seasons', 2),

-- Unterkategorien für Fantasy
(11, 'Magic & Spells', 3),
(12, 'Monsters', 3),
(13, 'Medieval Objects', 3),

-- Unterkategorien für Urban
(14, 'City Skylines', 4),
(15, 'Street Art', 4),

-- Unterkategorien für Animals
(16, 'Cats & Dogs', 5),
(17, 'Birds', 5),
(18, 'Mythical Creatures', 5);