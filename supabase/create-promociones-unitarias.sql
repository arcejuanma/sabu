-- Eliminar tabla si existe para evitar conflictos
DROP TABLE IF EXISTS promociones_unitarias CASCADE;

-- Crear tabla de promociones unitarias
CREATE TABLE promociones_unitarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  supermercado_id UUID REFERENCES supermercados(id) ON DELETE CASCADE,
  medio_de_pago_id UUID REFERENCES medios_de_pago(id) ON DELETE SET NULL, -- Medio de pago exclusivo (NULL = para todos)
  unidad_descuento INTEGER NOT NULL, -- Cada cuántas unidades se activa el descuento (ej: cada 2 unidades)
  descuento_porcentaje DECIMAL(5, 2) NOT NULL, -- Descuento aplicado en porcentaje (ej: 25.00 = 25%)
  limite_unidades INTEGER, -- Límite de unidades elegibles para el descuento (NULL = sin límite)
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  descripcion TEXT, -- Descripción opcional de la promoción
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_promociones_producto ON promociones_unitarias(producto_id);
CREATE INDEX IF NOT EXISTS idx_promociones_supermercado ON promociones_unitarias(supermercado_id);
CREATE INDEX IF NOT EXISTS idx_promociones_medio_pago ON promociones_unitarias(medio_de_pago_id);
CREATE INDEX IF NOT EXISTS idx_promociones_fechas ON promociones_unitarias(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_promociones_activo ON promociones_unitarias(activo);

-- Agregar política RLS
ALTER TABLE promociones_unitarias ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública de las promociones activas
CREATE POLICY "Allow public read access to active promotions"
ON promociones_unitarias
FOR SELECT
USING (activo = true AND NOW() >= fecha_inicio AND NOW() <= fecha_fin);

-- Política para permitir lectura completa de promociones (para admins)
CREATE POLICY "Allow authenticated read access to all promotions"
ON promociones_unitarias
FOR SELECT
TO authenticated
USING (true);

-- Insertar algunos ejemplos de promociones
INSERT INTO promociones_unitarias (
  producto_id,
  supermercado_id,
  medio_de_pago_id,
  unidad_descuento,
  descuento_porcentaje,
  limite_unidades,
  fecha_inicio,
  fecha_fin,
  descripcion,
  activo
) VALUES
-- Ejemplo 1: 2x1 en producto X en Disco (25% desc, límite 4 unidades, sin medio de pago específico)
(
  (SELECT id FROM productos LIMIT 1),
  (SELECT id FROM supermercados WHERE nombre = 'Disco' LIMIT 1),
  NULL, -- sin medio de pago específico
  2, -- cada 2 unidades
  25.00, -- 25% de descuento
  4, -- límite de 4 unidades
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  '2x1 Promoción Especial',
  true
),
-- Ejemplo 2: Cada 3 unidades, 15% desc, sin límite, exclusivo para Visa
(
  (SELECT id FROM productos LIMIT 1 OFFSET 1),
  (SELECT id FROM supermercados WHERE nombre = 'Carrefour' LIMIT 1),
  (SELECT id FROM medios_de_pago WHERE nombre LIKE '%Visa%' LIMIT 1), -- exclusivo para Visa
  3, -- cada 3 unidades
  15.00, -- 15% de descuento
  NULL, -- sin límite
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days',
  'Descuento por volumen - Exclusivo Visa',
  true
);

-- Verificar que la tabla fue creada
SELECT 
  'Tabla promociones_unitarias creada exitosamente' as status,
  COUNT(*) as total_promociones
FROM promociones_unitarias;

