-- Verificar políticas RLS y permisos para categorias_productos
-- Ejecutar en Supabase SQL Editor

-- 1. Ver si hay políticas RLS habilitadas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'categorias_productos';

-- 2. Ver todas las políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'categorias_productos';

-- 3. Ver si existen datos
SELECT COUNT(*) as total_categorias FROM categorias_productos;

-- 4. Ver los datos directamente
SELECT * FROM categorias_productos LIMIT 10;

-- 5. Verificar permisos anónimos
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'categorias_productos';
