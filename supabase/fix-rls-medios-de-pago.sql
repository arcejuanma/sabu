-- Verificar y corregir políticas RLS para medios_de_pago

-- 1. Ver las políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'medios_de_pago';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE medios_de_pago ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Anyone can view payment methods" ON medios_de_pago;
DROP POLICY IF EXISTS "Allow public read access" ON medios_de_pago;
DROP POLICY IF EXISTS "Public can view payment methods" ON medios_de_pago;
DROP POLICY IF EXISTS "Allow public read access to payment methods" ON medios_de_pago;

-- 4. Crear política para permitir lectura pública
CREATE POLICY "Allow public read access to payment methods"
ON medios_de_pago
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
WHERE tablename = 'medios_de_pago';

-- 6. Test: Verificar que se pueden leer datos
SELECT COUNT(*) as total_medios FROM medios_de_pago;
SELECT * FROM medios_de_pago LIMIT 5;
