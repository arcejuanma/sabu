-- Eliminar productos de prueba
-- Ejecutar en Supabase SQL Editor

-- Eliminar todos los productos que fueron insertados como ejemplo
DELETE FROM productos 
WHERE nombre IN (
  'Bananas',
  'Manzanas Rojas',
  'Tomates',
  'Pollo Entero',
  'Carne Molida',
  'Suprema de Pollo',
  'Leche Entera 1L',
  'Huevos x12',
  'Queso Cremoso',
  'Agua Mineral 1.5L',
  'Coca Cola 2.25L',
  'Jugo Naranja 1L',
  'Lavandina 1L',
  'Detergente 800ml',
  'Esponja Metálica'
);

-- Verificar que se eliminaron
SELECT COUNT(*) as productos_restantes FROM productos;
