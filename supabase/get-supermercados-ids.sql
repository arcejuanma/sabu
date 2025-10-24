-- Query para obtener los IDs reales de los supermercados
-- Ejecutar en Supabase SQL Editor

-- Ver todos los supermercados con sus IDs
SELECT 
  id,
  nombre,
  activo,
  created_at
FROM supermercados 
ORDER BY nombre;

-- Ver solo los supermercados activos
SELECT 
  id,
  nombre
FROM supermercados 
WHERE activo = true
ORDER BY nombre;
