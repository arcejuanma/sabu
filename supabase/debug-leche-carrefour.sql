-- Script para debuggear promociones de leche en Carrefour
-- Ejecutar en Supabase SQL Editor

-- 1. Buscar el producto "Leche Entera Clásica La Serenísima Botella Larga Vida 1L"
SELECT 
  id,
  nombre
FROM productos
WHERE nombre ILIKE '%Leche Entera Clásica La Serenísima%'
  OR nombre ILIKE '%Leche%Serenísima%';

-- 2. Buscar Carrefour
SELECT 
  id,
  nombre
FROM supermercados
WHERE nombre ILIKE '%carrefour%';

-- 3. Buscar promociones unitarias para leche en Carrefour
-- NOTA: Reemplazar 'PRODUCTO_ID' y 'SUPERMERCADO_ID' con los IDs obtenidos arriba
SELECT 
  pu.*,
  p.nombre as producto_nombre,
  s.nombre as supermercado_nombre
FROM promociones_unitarias pu
JOIN productos p ON pu.producto_id = p.id
JOIN supermercados s ON pu.supermercado_id = s.id
WHERE p.nombre ILIKE '%Leche Entera Clásica La Serenísima%'
  AND s.nombre ILIKE '%carrefour%'
  AND pu.activo = true
  AND CURRENT_DATE >= pu.fecha_inicio
  AND CURRENT_DATE <= pu.fecha_fin;

-- 4. Verificar el precio del producto en Carrefour
SELECT 
  ps.precio,
  p.nombre as producto_nombre,
  s.nombre as supermercado_nombre
FROM productos_x_supermercado ps
JOIN productos p ON ps.producto_id = p.id
JOIN supermercados s ON ps.supermercado_id = s.id
WHERE p.nombre ILIKE '%Leche Entera Clásica La Serenísima%'
  AND s.nombre ILIKE '%carrefour%';

