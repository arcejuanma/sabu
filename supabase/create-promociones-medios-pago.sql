-- Crear tabla de promociones de medios de pago
DROP TABLE IF EXISTS promociones_medios_pago CASCADE;

CREATE TABLE promociones_medios_pago(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id) ON DELETE CASCADE,
  supermercado_id UUID REFERENCES supermercados(id) ON DELETE CASCADE,
  dias_semana INTEGER[] NOT NULL, -- Array de días de la semana (1=lunes, 7=domingo)
  descuento_porcentaje DECIMAL(5, 2) NOT NULL, -- Descuento aplicado en porcentaje (ej: 20.00 = 20%)
  acumulable BOOLEAN DEFAULT false, -- Si true, se puede acumular con otras promociones
  categoria_excluida UUID REFERENCES categorias_productos(id) ON DELETE SET NULL, -- Categorías excluidas del descuento (NULL = aplica a todo)
  tope_descuento DECIMAL(10, 2), -- Tope máximo de descuento en dinero (NULL = sin tope)
  beneficios_extra TEXT, -- Beneficios extra de la promoción (ej: "Envío gratis", "Regalo adicional")
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  descripcion TEXT, -- Descripción opcional de la promoción
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_promo_mp_medio_pago ON promociones_medios_pago(medio_de_pago_id);
CREATE INDEX IF NOT EXISTS idx_promo_mp_supermercado ON promociones_medios_pago(supermercado_id);
CREATE INDEX IF NOT EXISTS idx_promo_mp_dias ON promociones_medios_pago USING GIN (dias_semana);
CREATE INDEX IF NOT EXISTS idx_promo_mp_fechas ON promociones_medios_pago(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_promo_mp_activo ON promociones_medios_pago(activo);

-- Agregar política RLS
ALTER TABLE promociones_medios_pago ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública de las promociones activas
CREATE POLICY "Allow public read access to active payment method promotions"
ON promociones_medios_pago
FOR SELECT
USING (activo = true AND NOW() >= fecha_inicio AND NOW() <= fecha_fin);

-- Política para permitir lectura completa de promociones (para admins)
CREATE POLICY "Allow authenticated read access to all payment method promotions"
ON promociones_medios_pago
FOR SELECT
TO authenticated
USING (true);

-- Insertar algunos ejemplos de promociones
-- Nota: Ejecuta estos INSERTs solo si ya existen datos en medios_de_pago y supermercados
-- Por seguridad, están comentados. Descomenta y ajusta los IDs según tu base de datos.

-- Verificar la tabla
SELECT 'Tabla promociones_medios_pago creada exitosamente' as status;

