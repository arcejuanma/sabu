-- Script para crear y configurar medios de pago con categorías
-- Categorías: Billetera Virtual, Tarjeta de Débito, Tarjeta de Crédito

-- PASO 1: Modificar la tabla medios_de_pago para agregar categoría

-- Agregar columna categoria si no existe
ALTER TABLE medios_de_pago 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) NOT NULL DEFAULT 'Tarjeta de Crédito';

-- Actualizar los medios de pago existentes con sus categorías
UPDATE medios_de_pago 
SET categoria = 'Tarjeta de Crédito'
WHERE tipo IN ('Visa', 'Mastercard', 'American Express');

UPDATE medios_de_pago 
SET categoria = 'Billetera Virtual'
WHERE tipo IN ('Mercado Pago', 'Ualá');

-- Agregar más medios de pago con todas las categorías
-- Billeteras Virtuales
INSERT INTO medios_de_pago (tipo, banco, nombre, categoria, activo) VALUES
('Billetera Virtual', 'Mercado Pago', 'Mercado Pago', 'Billetera Virtual', true),
('Billetera Virtual', 'Ualá', 'Ualá', 'Billetera Virtual', true),
('Billetera Virtual', 'Lemon Cash', 'Lemon Cash', 'Billetera Virtual', true),
('Billetera Virtual', 'Personal Pay', 'Personal Pay', 'Billetera Virtual', true),
('Billetera Virtual', 'Brubank Pay', 'Brubank Pay', 'Billetera Virtual', true),
('Billetera Virtual', 'Airtm', 'Airtm', 'Billetera Virtual', true);

-- Tarjetas de Débito
INSERT INTO medios_de_pago (tipo, banco, nombre, categoria, activo) VALUES
('Tarjeta de Débito', 'Santander', 'Visa Débito Santander', 'Tarjeta de Débito', true),
('Tarjeta de Débito', 'Banco Nación', 'Visa Débito Banco Nación', 'Tarjeta de Débito', true),
('Tarjeta de Débito', 'BBVA', 'Visa Débito BBVA', 'Tarjeta de Débito', true),
('Tarjeta de Débito', 'Galicia', 'Mastercard Débito Galicia', 'Tarjeta de Débito', true),
('Tarjeta de Débito', 'Macro', 'Visa Débito Macro', 'Tarjeta de Débito', true),
('Tarjeta de Débito', 'Provincia', 'Visa Débito Provincia', 'Tarjeta de Débito', true),
('Tarjeta de Débito', 'ICBC', 'Mastercard Débito ICBC', 'Tarjeta de Débito', true),
('Tarjeta de Débito', 'HSBC', 'Visa Débito HSBC', 'Tarjeta de Débito', true);

-- Tarjetas de Crédito
INSERT INTO medios_de_pago (tipo, banco, nombre, categoria, activo) VALUES
('Visa', 'Santander', 'Visa Crédito Santander', 'Tarjeta de Crédito', true),
('Mastercard', 'Galicia', 'Mastercard Crédito Galicia', 'Tarjeta de Crédito', true),
('American Express', 'American Express', 'American Express', 'Tarjeta de Crédito', true),
('Visa', 'BBVA', 'Visa Crédito BBVA', 'Tarjeta de Crédito', true),
('Mastercard', 'Macro', 'Mastercard Crédito Macro', 'Tarjeta de Crédito', true),
('Visa', 'Provincia', 'Visa Crédito Provincia', 'Tarjeta de Crédito', true),
('Visa', 'ICBC', 'Visa Crédito ICBC', 'Tarjeta de Crédito', true),
('Mastercard', 'HSBC', 'Mastercard Crédito HSBC', 'Tarjeta de Crédito', true),
('Visa', 'Credicoop', 'Visa Crédito Credicoop', 'Tarjeta de Crédito', true),
('Mastercard', 'Hipotecario', 'Mastercard Crédito Hipotecario', 'Tarjeta de Crédito', true);

-- Verificar que las políticas RLS permitan leer medios_de_pago para todos
DROP POLICY IF EXISTS "Allow public read access to payment methods" ON medios_de_pago;

CREATE POLICY "Allow public read access to payment methods" ON medios_de_pago
  FOR SELECT USING (true);

-- Mensaje de confirmación
SELECT 'Medios de pago con categorías creados exitosamente!' as status;

-- Ver datos insertados
SELECT categoria, COUNT(*) as cantidad
FROM medios_de_pago
GROUP BY categoria
ORDER BY categoria;
