-- Habilitar lectura pública en productos
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Public can view products" ON productos;
DROP POLICY IF EXISTS "Anyone can view products" ON productos;

-- 2. Crear política para permitir lectura pública
CREATE POLICY "Allow public read access on products"
ON productos
FOR SELECT
USING (activo = true);

-- 3. Verificar que la política fue creada
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'productos';
