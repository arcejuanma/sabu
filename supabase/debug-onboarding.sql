-- Script para debuggear el onboarding
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si el usuario existe
SELECT 
  id,
  nombre,
  apellido,
  email,
  telefono,
  created_at
FROM usuarios 
WHERE id = 'bcf24395-2ca9-4911-9bf9-2d4d8f9de8b9';

-- 2. Verificar supermercados disponibles
SELECT 
  id,
  nombre,
  activo
FROM supermercados 
ORDER BY nombre;

-- 3. Verificar supermercados preferidos del usuario
SELECT 
  spu.id,
  spu.usuario_id,
  spu.supermercado_id,
  spu.activo,
  s.nombre as supermercado_nombre
FROM supermercados_preferidos_usuario spu
LEFT JOIN supermercados s ON s.id = spu.supermercado_id
WHERE spu.usuario_id = 'bcf24395-2ca9-4911-9bf9-2d4d8f9de8b9';

-- 4. Verificar políticas RLS para supermercados_preferidos_usuario
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'supermercados_preferidos_usuario';

-- 5. Verificar si hay errores en la tabla
SELECT 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN activo = true THEN 1 END) as activos,
  COUNT(CASE WHEN activo = false THEN 1 END) as inactivos
FROM supermercados_preferidos_usuario 
WHERE usuario_id = 'bcf24395-2ca9-4911-9bf9-2d4d8f9de8b9';
