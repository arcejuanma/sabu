-- Verificar políticas RLS para supermercados
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla supermercados tiene RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'supermercados';

-- 2. Verificar políticas RLS para supermercados
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'supermercados';

-- 3. Verificar datos en la tabla supermercados
SELECT 
  id,
  nombre,
  activo,
  created_at
FROM supermercados 
ORDER BY nombre;

-- 4. Verificar si hay políticas que bloqueen el acceso
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'supermercados'
ORDER BY policyname;
