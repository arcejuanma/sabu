-- Agregar política INSERT faltante para tabla usuarios
-- Ejecutar en Supabase SQL Editor

-- Verificar si ya existe la política de INSERT
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'usuarios' 
  AND cmd = 'INSERT';

-- Crear política INSERT si no existe
CREATE POLICY "Users can insert own profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verificar que se creó correctamente
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY cmd;

-- Mensaje de confirmación
SELECT 'Política INSERT para usuarios agregada exitosamente!' as status;
