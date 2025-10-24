-- Query para verificar qué tablas existen en Supabase
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todas las tablas en el esquema public
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Ver tablas específicas de SABU que deberían existir
SELECT 
  tablename,
  CASE 
    WHEN tablename IN (
      'usuarios',
      'medios_de_pago', 
      'segmentos',
      'segmentos_x_medio_de_pago',
      'medios_de_pago_x_usuario',
      'categorias_productos',
      'productos',
      'supermercados',
      'supermercados_preferidos_usuario',
      'productos_x_supermercado',
      'beneficios_bancarios',
      'beneficios_super_unitarios',
      'beneficios_super_cantidad',
      'cupos_usuario',
      'carritos_x_usuario',
      'criterios_sustitucion',
      'productos_x_carrito',
      'productos_similares',
      'notificaciones',
      'historial_compras',
      'aplicacion_beneficios',
      'sugerencias_sustitucion'
    ) THEN '✅ DEBERÍA EXISTIR'
    ELSE '❌ NO DEFINIDA'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'usuarios',
    'medios_de_pago', 
    'segmentos',
    'segmentos_x_medio_de_pago',
    'medios_de_pago_x_usuario',
    'categorias_productos',
    'productos',
    'supermercados',
    'supermercados_preferidos_usuario',
    'productos_x_supermercado',
    'beneficios_bancarios',
    'beneficios_super_unitarios',
    'beneficios_super_cantidad',
    'cupos_usuario',
    'carritos_x_usuario',
    'criterios_sustitucion',
    'productos_x_carrito',
    'productos_similares',
    'notificaciones',
    'historial_compras',
    'aplicacion_beneficios',
    'sugerencias_sustitucion'
  )
ORDER BY tablename;

-- 3. Ver estructura de tabla usuarios (si existe)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Ver estructura de tabla supermercados_preferidos_usuario (si existe)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'supermercados_preferidos_usuario' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Ver políticas RLS existentes
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
