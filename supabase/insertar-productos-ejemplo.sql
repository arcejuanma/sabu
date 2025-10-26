-- Insertar productos de ejemplo para cada categoría
-- Ejecutar en Supabase SQL Editor

-- Primero necesitamos los IDs de las categorías
-- Ajusta estos IDs según tus categorías reales

-- Frutas y Verduras
INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Bananas', 'Bananas por kilo', id, true
FROM categorias_productos WHERE nombre = 'Frutas y Verduras';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Manzanas Rojas', 'Manzanas rojas por kilo', id, true
FROM categorias_productos WHERE nombre = 'Frutas y Verduras';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Tomates', 'Tomates por kilo', id, true
FROM categorias_productos WHERE nombre = 'Frutas y Verduras';

-- Carnes y Aves
INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Pollo Entero', 'Pollo entero', id, true
FROM categorias_productos WHERE nombre = 'Carnes y Aves';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Carne Molida', 'Carne molida por kilo', id, true
FROM categorias_productos WHERE nombre = 'Carnes y Aves';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Suprema de Pollo', 'Supremas de pollo por kilo', id, true
FROM categorias_productos WHERE nombre = 'Carnes y Aves';

-- Lácteos y Huevos
INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Leche Entera 1L', 'Leche entera 1 litro', id, true
FROM categorias_productos WHERE nombre = 'Lácteos y Huevos';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Huevos x12', 'Docena de huevos', id, true
FROM categorias_productos WHERE nombre = 'Lácteos y Huevos';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Queso Cremoso', 'Queso cremoso por kilo', id, true
FROM categorias_productos WHERE nombre = 'Lácteos y Huevos';

-- Bebidas
INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Agua Mineral 1.5L', 'Agua mineral sin gas 1.5 litros', id, true
FROM categorias_productos WHERE nombre = 'Bebidas';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Coca Cola 2.25L', 'Coca Cola 2.25 litros', id, true
FROM categorias_productos WHERE nombre = 'Bebidas';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Jugo Naranja 1L', 'Jugo de naranja 1 litro', id, true
FROM categorias_productos WHERE nombre = 'Bebidas';

-- Limpieza
INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Lavandina 1L', 'Lavandina 1 litro', id, true
FROM categorias_productos WHERE nombre = 'Limpieza';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Detergente 800ml', 'Detergente líquido 800ml', id, true
FROM categorias_productos WHERE nombre = 'Limpieza';

INSERT INTO productos (nombre, descripcion, categoria_id, activo) 
SELECT 'Esponja Metálica', 'Esponja metálica de acero', id, true
FROM categorias_productos WHERE nombre = 'Limpieza';

-- Verificar que se insertaron los productos
SELECT 
    p.id,
    p.nombre,
    c.nombre as categoria
FROM productos p
JOIN categorias_productos c ON p.categoria_id = c.id
WHERE p.activo = true
ORDER BY c.nombre, p.nombre;
