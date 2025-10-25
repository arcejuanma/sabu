-- Migración para agregar campos de dirección a la tabla usuarios
-- Ejecutar en Supabase SQL Editor

-- Agregar campos de dirección a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN direccion VARCHAR(255),
ADD COLUMN altura VARCHAR(10),
ADD COLUMN codigo_postal VARCHAR(10);

-- Crear índices para mejorar performance en búsquedas por ubicación
CREATE INDEX idx_usuarios_codigo_postal ON usuarios(codigo_postal);
CREATE INDEX idx_usuarios_direccion ON usuarios(direccion);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN usuarios.direccion IS 'Dirección del usuario (ej: Av. Corrientes)';
COMMENT ON COLUMN usuarios.altura IS 'Altura de la dirección (ej: 1234)';
COMMENT ON COLUMN usuarios.codigo_postal IS 'Código postal de la dirección (ej: C1043)';

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('direccion', 'altura', 'codigo_postal')
ORDER BY column_name;

-- Mensaje de confirmación
SELECT 'Campos de dirección agregados exitosamente a la tabla usuarios!' as status;
