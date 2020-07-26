INSERT INTO Recipe
VALUES
('mac n cheese', 'lunch', 'example.com', 'example.com', NULL, 4, 800),
('meatballs', 'dinner', 'example.com', 'example.com', NULL, 4, 1100);

INSERT INTO Ingredient
VALUES
('macaroni', 'oz', 1.50),
('milk', 'gal', 1.59),
('butter', 'tbsp', 1.90),
('flour', 'lb', 3.42),
('salt', 'g', 0.02),
('garlic powder', 'g', 0.43),
('ground beef', 'lb', 5.84),
('bread crumbs', 'cups', 1.01),
('parmesan', 'cups', 2.00),
('egg', 'count', 0.45);

INSERT INTO Requires
VALUES
('macaroni', 'mac n cheese', 2, 'cups'),
('milk', 'mac n cheese', 1, 'cups'),
('flour', 'mac n cheese', 2, 'tbsp'),
('butter', 'mac n cheese', 6, 'tbsp'),
('salt', 'mac n cheese', 0.25, 'tsp'),
('garlic powder', 'mac n cheese', 1, 'tsp'),
('milk', 'meatballs', 1, 'tbsp'),
('ground beef', 'meatballs', 1, 'lb'),
('bread crumbs', 'meatballs', 1, 'cups'),
('egg', 'meatballs', 2, 'count'),
('parmesan', 'meatballs', 0.75, 'cups');
