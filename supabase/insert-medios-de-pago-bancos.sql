-- Insertar medios de pago agrupados por banco

-- Billeteras Virtuales
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Billetera Virtual', 'Mercado Pago', 'Mercado Pago', true),
('Billetera Virtual', 'Ualá', 'Ualá', true),
('Billetera Virtual', 'Lemon Cash', 'Lemon Cash', true),
('Billetera Virtual', 'Personal Pay', 'Personal Pay', true),
('Billetera Virtual', 'Brubank Pay', 'Brubank Pay', true),
('Billetera Virtual', 'Airtm', 'Airtm', true);

-- Santander
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'Santander', 'Visa Débito Santander', true),
('Visa', 'Santander', 'Visa Crédito Santander', true);

-- Galicia
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'Galicia', 'Mastercard Débito Galicia', true),
('Mastercard', 'Galicia', 'Mastercard Crédito Galicia', true);

-- BBVA
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'BBVA', 'Visa Débito BBVA', true),
('Visa', 'BBVA', 'Visa Crédito BBVA', true);

-- Banco Nación
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'Banco Nación', 'Visa Débito Banco Nación', true);

-- Macro
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'Macro', 'Visa Débito Macro', true),
('Mastercard', 'Macro', 'Mastercard Crédito Macro', true);

-- Provincia
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'Provincia', 'Visa Débito Provincia', true),
('Visa', 'Provincia', 'Visa Crédito Provincia', true);

-- ICBC
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'ICBC', 'Mastercard Débito ICBC', true),
('Visa', 'ICBC', 'Visa Crédito ICBC', true);

-- HSBC
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Tarjeta de Débito', 'HSBC', 'Visa Débito HSBC', true),
('Mastercard', 'HSBC', 'Mastercard Crédito HSBC', true);

-- Credicoop
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Visa', 'Credicoop', 'Visa Crédito Credicoop', true);

-- Hipotecario
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('Mastercard', 'Hipotecario', 'Mastercard Crédito Hipotecario', true);

-- American Express
INSERT INTO medios_de_pago (tipo, banco, nombre, activo) VALUES
('American Express', 'American Express', 'American Express', true);

-- Verificar inserciones
SELECT banco, COUNT(*) as cantidad
FROM medios_de_pago
GROUP BY banco
ORDER BY banco;
