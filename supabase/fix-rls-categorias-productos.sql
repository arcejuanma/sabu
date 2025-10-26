-- Habilitar lectura pública en categorias_productos
-- Ejecutar en Supabase SQL Editor

-- 1. Ver estado actual de RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'categorias_productos';

-- 2. Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Anyone can view product categories" ON categorias_productos;
DROP POLICY IF EXISTS "Public can view categories" ON categorias_productos;
DROP POLICY IF EXISTS "Users can view categories" ON categorias_productos;

-- 3. Crear política para permitir lectura pública
CREATE POLICY "Allow public read access on product categories"
ON categorias_productos
FOR SELECT
USING (true);

-- 4. Verificar que la política fue creada
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'categorias_productos';

-- 5. Test: Verificar que se pueden leer datos
SELECT COUNT(*) as total_categorias FROM categorias_productos;
SELECT * FROM categorias_productos LIMIT 5;
