-- Corregir políticas RLS para promociones_unitarias
-- Permitir lectura pública de las promociones activas

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow public read access to active promotions" ON promociones_unitarias;
DROP POLICY IF EXISTS "Allow authenticated read access to all promotions" ON promociones_unitarias;

-- Crear política para permitir lectura pública de las promociones activas
CREATE POLICY "Allow public read access to active promotions"
ON promociones_unitarias
FOR SELECT
USING (activo = true AND NOW() >= fecha_inicio AND NOW() <= fecha_fin);

-- Crear política para permitir lectura completa de promociones (para admins)
CREATE POLICY "Allow authenticated read access to all promotions"
ON promociones_unitarias
FOR SELECT
TO authenticated
USING (true);

-- Verificar las políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'promociones_unitarias';
