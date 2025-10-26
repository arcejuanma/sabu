-- Verificar medios de pago en la base de datos

-- 1. Ver la estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medios_de_pago';

-- 2. Ver todos los medios de pago
SELECT id, tipo, banco, nombre, categoria, activo 
FROM medios_de_pago 
ORDER BY categoria, nombre;

-- 3. Contar medios de pago por categoría
SELECT categoria, COUNT(*) as cantidad
FROM medios_de_pago
GROUP BY categoria
ORDER BY categoria;

-- 4. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'medios_de_pago';
