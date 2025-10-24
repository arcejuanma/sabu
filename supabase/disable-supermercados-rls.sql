-- Alternativa: Deshabilitar RLS para supermercados
-- Ejecutar SOLO si la política anterior no funciona

-- 1. Deshabilitar RLS para supermercados
ALTER TABLE supermercados DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que se deshabilitó
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'supermercados';

-- 3. Probar la consulta
SELECT 
  id,
  nombre,
  activo
FROM supermercados 
WHERE activo = true
ORDER BY nombre;

-- Mensaje de confirmación
SELECT 'RLS deshabilitado para supermercados!' as status;
