-- Verificar y corregir políticas RLS para productos_x_supermercado
-- Ejecutar en Supabase SQL Editor

-- 1. Ver el estado actual de RLS
SELECT 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE tablename = 'productos_x_supermercado';

-- 2. Ver las políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'productos_x_supermercado';

-- 3. Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Anyone can view product supermarket prices" ON productos_x_supermercado;
DROP POLICY IF EXISTS "Allow public read access" ON productos_x_supermercado;
DROP POLICY IF EXISTS "Public can view product prices" ON productos_x_supermercado;

-- 4. Crear política para permitir lectura pública
CREATE POLICY "Allow public read access on product supermarket prices"
ON productos_x_supermercado
FOR SELECT
USING (true);

-- 5. Verificar que la política fue creada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'productos_x_supermercado';

-- 6. Test: Verificar que se pueden leer datos
SELECT COUNT(*) as total_precios FROM productos_x_supermercado;
SELECT * FROM productos_x_supermercado LIMIT 5;
