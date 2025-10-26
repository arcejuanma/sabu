-- Verificar y agregar precios de productos por supermercado
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todos los productos
SELECT 
  id,
  nombre,
  categoria_id,
  activo
FROM productos 
WHERE activo = true
ORDER BY nombre;

-- 2. Ver todos los supermercados
SELECT 
  id,
  nombre,
  activo
FROM supermercados 
WHERE activo = true
ORDER BY nombre;

-- 3. Ver los precios actuales en productos_x_supermercado
SELECT 
  pxs.id,
  p.nombre as producto,
  s.nombre as supermercado,
  pxs.precio,
  pxs.activo
FROM productos_x_supermercado pxs
JOIN productos p ON pxs.producto_id = p.id
JOIN supermercados s ON pxs.supermercado_id = s.id
ORDER BY p.nombre, s.nombre;

-- 4. Contar cuántos precios existen por supermercado
SELECT 
  s.nombre as supermercado,
  COUNT(*) as cantidad_precios
FROM productos_x_supermercado pxs
JOIN supermercados s ON pxs.supermercado_id = s.id
WHERE pxs.activo = true
GROUP BY s.nombre
ORDER BY cantidad_precios DESC;

-- 5. Insertar precios de ejemplo para los productos existentes
-- (Ajusta estos valores según tus necesidades)
INSERT INTO productos_x_supermercado (producto_id, supermercado_id, precio, activo)
SELECT 
  p.id as producto_id,
  s.id as supermercado_id,
  CASE 
    WHEN s.nombre = 'Disco' THEN 500.00
    WHEN s.nombre = 'Carrefour' THEN 480.00
    WHEN s.nombre = 'Jumbo' THEN 520.00
    WHEN s.nombre = 'Coto' THEN 490.00
    ELSE 500.00
  END as precio,
  true as activo
FROM productos p
CROSS JOIN supermercados s
WHERE p.activo = true 
  AND s.activo = true
  AND NOT EXISTS (
    SELECT 1 
    FROM productos_x_supermercado pxs
    WHERE pxs.producto_id = p.id 
      AND pxs.supermercado_id = s.id
  );

-- 6. Verificar que se insertaron los precios
SELECT 
  p.nombre as producto,
  s.nombre as supermercado,
  pxs.precio,
  pxs.activo
FROM productos_x_supermercado pxs
JOIN productos p ON pxs.producto_id = p.id
JOIN supermercados s ON pxs.supermercado_id = s.id
WHERE pxs.activo = true
ORDER BY p.nombre, s.nombre;
