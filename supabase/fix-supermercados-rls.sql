-- Corregir políticas RLS para supermercados
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estado actual
SELECT 
  tablename,
  rowsecurity,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'supermercados') as policy_count
FROM pg_tables 
WHERE tablename = 'supermercados';

-- 2. Crear política para permitir lectura pública de supermercados
CREATE POLICY "Anyone can view supermarkets" ON supermercados
  FOR SELECT USING (true);

-- 3. Verificar que se creó la política
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'supermercados';

-- 4. Probar la consulta
SELECT 
  id,
  nombre,
  activo
FROM supermercados 
WHERE activo = true
ORDER BY nombre;

-- Mensaje de confirmación
SELECT 'Política RLS para supermercados creada exitosamente!' as status;
