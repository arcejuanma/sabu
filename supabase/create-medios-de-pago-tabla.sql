-- Script para crear/modificar la tabla medios_de_pago con categorías

-- PASO 1: Verificar si existe la columna categoria
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'medios_de_pago' 
        AND column_name = 'categoria'
    ) THEN
        -- Agregar columna categoria
        ALTER TABLE medios_de_pago 
        ADD COLUMN categoria VARCHAR(50) DEFAULT 'Tarjeta de Crédito' NOT NULL;
        
        RAISE NOTICE 'Columna categoria agregada a medios_de_pago';
    ELSE
        RAISE NOTICE 'La columna categoria ya existe';
    END IF;
END $$;

-- PASO 2: Actualizar categorías de los medios existentes
UPDATE medios_de_pago 
SET categoria = 'Tarjeta de Crédito'
WHERE categoria IS NULL OR (tipo IN ('Visa', 'Mastercard', 'American Express') AND categoria = 'Tarjeta de Crédito');

UPDATE medios_de_pago 
SET categoria = 'Billetera Virtual'
WHERE tipo IN ('Mercado Pago', 'Ualá', 'Lemon Cash', 'Personal Pay', 'Brubank Pay', 'Airtm');

UPDATE medios_de_pago 
SET categoria = 'Tarjeta de Débito'
WHERE tipo = 'Tarjeta de Débito';

-- PASO 3: Insertar medios de pago si la tabla está vacía o con pocos registros
INSERT INTO medios_de_pago (tipo, banco, nombre, categoria, activo)
SELECT * FROM (VALUES
  -- Billeteras Virtuales
  ('Billetera Virtual', 'Mercado Pago', 'Mercado Pago', 'Billetera Virtual', true),
  ('Billetera Virtual', 'Ualá', 'Ualá', 'Billetera Virtual', true),
  ('Billetera Virtual', 'Lemon Cash', 'Lemon Cash', 'Billetera Virtual', true),
  ('Billetera Virtual', 'Personal Pay', 'Personal Pay', 'Billetera Virtual', true),
  ('Billetera Virtual', 'Brubank Pay', 'Brubank Pay', 'Billetera Virtual', true),
  ('Billetera Virtual', 'Airtm', 'Airtm', 'Billetera Virtual', true),
  
  -- Tarjetas de Débito
  ('Tarjeta de Débito', 'Santander', 'Visa Débito Santander', 'Tarjeta de Débito', true),
  ('Tarjeta de Débito', 'Banco Nación', 'Visa Débito Banco Nación', 'Tarjeta de Débito', true),
  ('Tarjeta de Débito', 'BBVA', 'Visa Débito BBVA', 'Tarjeta de Débito', true),
  ('Tarjeta de Débito', 'Galicia', 'Mastercard Débito Galicia', 'Tarjeta de Débito', true),
  ('Tarjeta de Débito', 'Macro', 'Visa Débito Macro', 'Tarjeta de Débito', true),
  ('Tarjeta de Débito', 'Provincia', 'Visa Débito Provincia', 'Tarjeta de Débito', true),
  ('Tarjeta de Débito', 'ICBC', 'Mastercard Débito ICBC', 'Tarjeta de Débito', true),
  ('Tarjeta de Débito', 'HSBC', 'Visa Débito HSBC', 'Tarjeta de Débito', true),
  
  -- Tarjetas de Crédito
  ('Visa', 'Santander', 'Visa Crédito Santander', 'Tarjeta de Crédito', true),
  ('Mastercard', 'Galicia', 'Mastercard Crédito Galicia', 'Tarjeta de Crédito', true),
  ('American Express', 'American Express', 'American Express', 'Tarjeta de Crédito', true),
  ('Visa', 'BBVA', 'Visa Crédito BBVA', 'Tarjeta de Crédito', true),
  ('Mastercard', 'Macro', 'Mastercard Crédito Macro', 'Tarjeta de Crédito', true),
  ('Visa', 'Provincia', 'Visa Crédito Provincia', 'Tarjeta de Crédito', true),
  ('Visa', 'ICBC', 'Visa Crédito ICBC', 'Tarjeta de Crédito', true),
  ('Mastercard', 'HSBC', 'Mastercard Crédito HSBC', 'Tarjeta de Crédito', true),
  ('Visa', 'Credicoop', 'Visa Crédito Credicoop', 'Tarjeta de Crédito', true),
  ('Mastercard', 'Hipotecario', 'Mastercard Crédito Hipotecario', 'Tarjeta de Crédito', true)
) AS v(tipo, banco, nombre, categoria, activo)
WHERE NOT EXISTS (
  SELECT 1 FROM medios_de_pago WHERE medios_de_pago.nombre = v.nombre
);

-- PASO 4: Verificar que las políticas RLS permitan lectura
DROP POLICY IF EXISTS "Allow public read access to payment methods" ON medios_de_pago;

CREATE POLICY "Allow public read access to payment methods" ON medios_de_pago
  FOR SELECT USING (true);

-- PASO 5: Verificar datos
SELECT categoria, COUNT(*) as cantidad
FROM medios_de_pago
GROUP BY categoria
ORDER BY categoria;

-- Mensaje final
SELECT 'Medios de pago configurados exitosamente!' as status;
