-- SABU Database Schema Completo
-- Ejecutar en Supabase SQL Editor para configurar el ambiente completo

-- PASO 1: Eliminar tablas existentes (en orden correcto para evitar conflictos de FK)
DROP TABLE IF EXISTS aplicacion_beneficios CASCADE;
DROP TABLE IF EXISTS cupos_usuario CASCADE;
DROP TABLE IF EXISTS sugerencias_sustitucion CASCADE;
DROP TABLE IF EXISTS productos_x_carrito CASCADE;
DROP TABLE IF EXISTS carritos_x_usuario CASCADE;
DROP TABLE IF EXISTS criterios_sustitucion CASCADE;
DROP TABLE IF EXISTS productos_similares CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS historial_compras CASCADE;
DROP TABLE IF EXISTS supermercados_preferidos_usuario CASCADE;
DROP TABLE IF EXISTS productos_x_supermercado CASCADE;
DROP TABLE IF EXISTS beneficios_super_cantidad CASCADE;
DROP TABLE IF EXISTS beneficios_super_unitarios CASCADE;
DROP TABLE IF EXISTS beneficios_bancarios CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias_productos CASCADE;
DROP TABLE IF EXISTS supermercados CASCADE;
DROP TABLE IF EXISTS medios_de_pago_x_usuario CASCADE;
DROP TABLE IF EXISTS segmentos_x_medio_de_pago CASCADE;
DROP TABLE IF EXISTS segmentos CASCADE;
DROP TABLE IF EXISTS medios_de_pago CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- PASO 2: Crear el modelo completo

-- 1. Usuarios (con nombre y apellido separados)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Medios de Pago
CREATE TABLE medios_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- visa, mastercard, amex
  banco VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Segmentos
CREATE TABLE segmentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Segmentos X Medio de Pago
CREATE TABLE segmentos_x_medio_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segmento_id UUID REFERENCES segmentos(id),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Medios de Pago X Usuario
CREATE TABLE medios_de_pago_x_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Categorías de Productos
CREATE TABLE categorias_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES categorias_productos(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Supermercados
CREATE TABLE supermercados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Supermercados Preferidos Usuario
CREATE TABLE supermercados_preferidos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  supermercado_id UUID REFERENCES supermercados(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Productos X Supermercado
CREATE TABLE productos_x_supermercado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id),
  supermercado_id UUID REFERENCES supermercados(id),
  precio DECIMAL(10, 2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Beneficios Bancarios (Complejos)
CREATE TABLE beneficios_bancarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  combinacion_exacta VARCHAR(255) NOT NULL,
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id),
  porcentaje_descuento DECIMAL(5, 2) NOT NULL,
  limite_mensual DECIMAL(10, 2) NOT NULL,
  dias_semana VARCHAR(20) NOT NULL, -- "lunes,martes,miércoles"
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Beneficios Supermercado Unitarios
CREATE TABLE beneficios_super_unitarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  supermercado_id UUID REFERENCES supermercados(id),
  porcentaje_descuento DECIMAL(5, 2) NOT NULL,
  categoria_id UUID REFERENCES categorias_productos(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Beneficios Supermercado por Cantidad
CREATE TABLE beneficios_super_cantidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  supermercado_id UUID REFERENCES supermercados(id),
  tipo_oferta VARCHAR(50) NOT NULL, -- "2da_unidad_70%", "4x3"
  categoria_id UUID REFERENCES categorias_productos(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Cupos Usuario
CREATE TABLE cupos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  beneficio_bancario_id UUID REFERENCES beneficios_bancarios(id),
  cupo_disponible_mes DECIMAL(10, 2) NOT NULL,
  cupo_usado_mes DECIMAL(10, 2) DEFAULT 0,
  mes_año VARCHAR(7) NOT NULL, -- "2024-01"
  actualizado_por VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Carritos X Usuario
CREATE TABLE carritos_x_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  frecuencia_dias INTEGER DEFAULT 7,
  proxima_notificacion TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Criterios de Sustitución
CREATE TABLE criterios_sustitucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  producto_id UUID REFERENCES productos(id),
  criterio VARCHAR(50) NOT NULL, -- "exacto", "calidad_similar", "precio_significativo", "solo_precio"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Productos X Carrito
CREATE TABLE productos_x_carrito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Productos Similares
CREATE TABLE productos_similares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_original_id UUID REFERENCES productos(id),
  producto_similar_id UUID REFERENCES productos(id),
  nivel_similitud VARCHAR(50) NOT NULL, -- "calidad_similar", "precio_significativo", "solo_precio"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Notificaciones
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  mensaje TEXT NOT NULL,
  enviada BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Historial de Compras
CREATE TABLE historial_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  total_ahorro DECIMAL(10, 2) DEFAULT 0,
  fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. Aplicación de Beneficios
CREATE TABLE aplicacion_beneficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  compra_id UUID REFERENCES historial_compras(id),
  beneficio_bancario_id UUID REFERENCES beneficios_bancarios(id),
  beneficio_super_unitario_id UUID REFERENCES beneficios_super_unitarios(id),
  beneficio_super_cantidad_id UUID REFERENCES beneficios_super_cantidad(id),
  monto_ahorro DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Sugerencias de Sustitución
CREATE TABLE sugerencias_sustitucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  producto_original_id UUID REFERENCES productos(id),
  producto_sugerido_id UUID REFERENCES productos(id),
  ahorro_estimado DECIMAL(10, 2) NOT NULL,
  aceptada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 3: Crear índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_telefono ON usuarios(telefono);
CREATE INDEX idx_carritos_usuario ON carritos_x_usuario(usuario_id);
CREATE INDEX idx_carritos_proxima_notificacion ON carritos_x_usuario(proxima_notificacion);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_beneficios_bancarios_fechas ON beneficios_bancarios(fecha_inicio, fecha_fin);
CREATE INDEX idx_beneficios_super_unitarios_fechas ON beneficios_super_unitarios(fecha_inicio, fecha_fin);
CREATE INDEX idx_beneficios_super_cantidad_fechas ON beneficios_super_cantidad(fecha_inicio, fecha_fin);

-- PASO 4: Configurar Row Level Security (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos_x_medio_de_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados_preferidos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_supermercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_bancarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_super_unitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_super_cantidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_sustitucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_similares ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacion_beneficios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugerencias_sustitucion ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Users can view own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para SUPERMERCADOS_PREFERIDOS_USUARIO
CREATE POLICY "Users can view own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para MEDIOS_DE_PAGO_X_USUARIO
CREATE POLICY "Users can view own payment methods" ON medios_de_pago_x_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own payment methods" ON medios_de_pago_x_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own payment methods" ON medios_de_pago_x_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own payment methods" ON medios_de_pago_x_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para CARRITOS_X_USUARIO
CREATE POLICY "Users can view own carts" ON carritos_x_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own carts" ON carritos_x_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own carts" ON carritos_x_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own carts" ON carritos_x_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para PRODUCTOS_X_CARRITO
CREATE POLICY "Users can view own cart products" ON productos_x_carrito
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cart products" ON productos_x_carrito
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart products" ON productos_x_carrito
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart products" ON productos_x_carrito
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

-- Políticas para NOTIFICACIONES
CREATE POLICY "Users can view own notifications" ON notificaciones
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can update own notifications" ON notificaciones
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para HISTORIAL_COMPRAS
CREATE POLICY "Users can view own purchase history" ON historial_compras
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own purchase history" ON historial_compras
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Políticas para CUPOS_USUARIO
CREATE POLICY "Users can view own monthly quotas" ON cupos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own monthly quotas" ON cupos_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own monthly quotas" ON cupos_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para CRITERIOS_SUSTITUCION
CREATE POLICY "Users can view own substitution criteria" ON criterios_sustitucion
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own substitution criteria" ON criterios_sustitucion
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own substitution criteria" ON criterios_sustitucion
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para SUGERENCIAS_SUSTITUCION
CREATE POLICY "Users can view own substitution suggestions" ON sugerencias_sustitucion
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own substitution suggestions" ON sugerencias_sustitucion
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Políticas para APLICACION_BENEFICIOS
CREATE POLICY "Users can view own benefit applications" ON aplicacion_beneficios
  FOR SELECT USING (auth.uid() = usuario_id);

-- PASO 5: Insertar datos iniciales

-- Medios de pago
INSERT INTO medios_de_pago (nombre, tipo, banco) VALUES
('Visa Santander', 'visa', 'Santander'),
('Mastercard Galicia', 'mastercard', 'Galicia'),
('Amex ICBC', 'amex', 'ICBC');

-- Segmentos
INSERT INTO segmentos (nombre, descripcion) VALUES
('Gold', 'Tarjetas Gold'),
('Platinum', 'Tarjetas Platinum'),
('Black', 'Tarjetas Black');

-- Categorías de productos
INSERT INTO categorias_productos (nombre, descripcion) VALUES
('Lácteos', 'Leche, yogur, queso'),
('Carnes', 'Carne vacuna, pollo, cerdo'),
('Verduras', 'Frutas y verduras frescas'),
('Limpieza', 'Productos de limpieza del hogar'),
('Bebidas', 'Bebidas alcohólicas y no alcohólicas');

-- Supermercados
INSERT INTO supermercados (nombre) VALUES
('Disco'),
('Carrefour'),
('Jumbo'),
('Coto'),
('Día'),
('Chango Más');

-- Productos de ejemplo
INSERT INTO productos (nombre, categoria_id) VALUES
('Leche La Serenísima 1L', (SELECT id FROM categorias_productos WHERE nombre = 'Lácteos')),
('Yogur Ser Natural', (SELECT id FROM categorias_productos WHERE nombre = 'Lácteos')),
('Asado', (SELECT id FROM categorias_productos WHERE nombre = 'Carnes')),
('Pollo entero', (SELECT id FROM categorias_productos WHERE nombre = 'Carnes')),
('Tomate', (SELECT id FROM categorias_productos WHERE nombre = 'Verduras')),
('Lechuga', (SELECT id FROM categorias_productos WHERE nombre = 'Verduras'));

-- Precios de ejemplo
INSERT INTO productos_x_supermercado (producto_id, supermercado_id, precio) VALUES
((SELECT id FROM productos WHERE nombre = 'Leche La Serenísima 1L'), (SELECT id FROM supermercados WHERE nombre = 'Disco'), 450.00),
((SELECT id FROM productos WHERE nombre = 'Leche La Serenísima 1L'), (SELECT id FROM supermercados WHERE nombre = 'Carrefour'), 420.00),
((SELECT id FROM productos WHERE nombre = 'Leche La Serenísima 1L'), (SELECT id FROM supermercados WHERE nombre = 'Jumbo'), 480.00);

-- Beneficios bancarios de ejemplo
INSERT INTO beneficios_bancarios (nombre, combinacion_exacta, medio_de_pago_id, segmento_id, porcentaje_descuento, limite_mensual, dias_semana, fecha_inicio, fecha_fin) VALUES
('Santander Visa Black - Cuenta Sueldo', 'Santander Visa Black Cuenta Sueldo', 
 (SELECT id FROM medios_de_pago WHERE nombre = 'Visa Santander'),
 (SELECT id FROM segmentos WHERE nombre = 'Black'),
 20.00, 20000.00, 'miércoles', '2024-01-01', '2024-12-31');

-- Beneficios de supermercado de ejemplo
INSERT INTO beneficios_super_unitarios (nombre, supermercado_id, porcentaje_descuento, categoria_id, fecha_inicio, fecha_fin) VALUES
('20% descuento en lácteos', 
 (SELECT id FROM supermercados WHERE nombre = 'Disco'),
 20.00, 
 (SELECT id FROM categorias_productos WHERE nombre = 'Lácteos'),
 '2024-01-01', '2024-12-31');

INSERT INTO beneficios_super_cantidad (nombre, supermercado_id, tipo_oferta, categoria_id, fecha_inicio, fecha_fin) VALUES
('2da unidad al 70% en lácteos', 
 (SELECT id FROM supermercados WHERE nombre = 'Carrefour'),
 '2da_unidad_70%', 
 (SELECT id FROM categorias_productos WHERE nombre = 'Lácteos'),
 '2024-01-01', '2024-12-31'),
('4x3 en limpieza', 
 (SELECT id FROM supermercados WHERE nombre = 'Jumbo'),
 '4x3', 
 (SELECT id FROM categorias_productos WHERE nombre = 'Limpieza'),
 '2024-01-01', '2024-12-31');

-- Mensaje de confirmación
SELECT 'SABU Database Schema Completo configurado exitosamente!' as status;
