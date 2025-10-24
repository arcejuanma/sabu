-- ALTER TABLE usuarios para separar nombre y apellido
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Agregar nuevas columnas
ALTER TABLE usuarios 
ADD COLUMN nombre_nuevo VARCHAR(100),
ADD COLUMN apellido VARCHAR(100);

-- Paso 2: Migrar datos existentes (si los hay)
-- Esto separa el nombre completo en nombre y apellido
UPDATE usuarios 
SET 
  nombre_nuevo = CASE 
    WHEN POSITION(' ' IN nombre) > 0 THEN 
      SUBSTRING(nombre FROM 1 FOR POSITION(' ' IN nombre) - 1)
    ELSE nombre
  END,
  apellido = CASE 
    WHEN POSITION(' ' IN nombre) > 0 THEN 
      SUBSTRING(nombre FROM POSITION(' ' IN nombre) + 1)
    ELSE ''
  END
WHERE nombre IS NOT NULL;

-- Paso 3: Eliminar columna antigua y renombrar
ALTER TABLE usuarios DROP COLUMN nombre;
ALTER TABLE usuarios RENAME COLUMN nombre_nuevo TO nombre;

-- Paso 4: Hacer las columnas NOT NULL
ALTER TABLE usuarios 
ALTER COLUMN nombre SET NOT NULL,
ALTER COLUMN apellido SET NOT NULL;

-- Paso 5: Agregar índices para performance
CREATE INDEX idx_usuarios_nombre ON usuarios(nombre);
CREATE INDEX idx_usuarios_apellido ON usuarios(apellido);
