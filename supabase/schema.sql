-- SABU Database Schema V4 - Modelo Simplificado
-- Sin geolocalización, usuario selecciona supermercados preferidos

-- PASO 1: Eliminar tablas existentes (en orden correcto para evitar conflictos de FK)

-- Eliminar tablas de aplicación de beneficios primero
DROP TABLE IF EXISTS aplicacion_beneficios CASCADE;
DROP TABLE IF EXISTS cupos_usuario CASCADE;
DROP TABLE IF EXISTS sugerencias_sustitucion CASCADE;

-- Eliminar tablas de beneficios
DROP TABLE IF EXISTS beneficios_x_medio_de_pago CASCADE;
DROP TABLE IF EXISTS beneficios_x_producto CASCADE;
DROP TABLE IF EXISTS beneficios CASCADE;

-- Eliminar tablas de productos y carritos
DROP TABLE IF EXISTS productos_x_carrito CASCADE;
DROP TABLE IF EXISTS carritos_x_usuario CASCADE;
DROP TABLE IF EXISTS productos_x_supermercado CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias_productos CASCADE;

-- Eliminar tablas de supermercados
DROP TABLE IF EXISTS sucursales CASCADE;
DROP TABLE IF EXISTS supermercados CASCADE;

-- Eliminar tablas de usuarios y medios de pago
DROP TABLE IF EXISTS historial_compras CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS medios_de_pago_x_usuario CASCADE;
DROP TABLE IF EXISTS segmentos_x_medio_de_pago CASCADE;
DROP TABLE IF EXISTS segmentos CASCADE;
DROP TABLE IF EXISTS medios_de_pago CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- PASO 2: Crear el modelo simplificado

-- 1. Usuarios (SIMPLIFICADO - sin geolocalización)
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
  tipo VARCHAR(50) NOT NULL, -- visa, mastercard, amex
  banco VARCHAR(100) NOT NULL, -- santander, galicia, etc
  nombre VARCHAR(255) NOT NULL, -- "Visa Santander", "Mastercard Galicia"
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Segmentos
CREATE TABLE segmentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL, -- cuenta_sueldo, black, premium
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Segmentos X Medio de Pago
CREATE TABLE segmentos_x_medio_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Medios de Pago X Usuario
CREATE TABLE medios_de_pago_x_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id),
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
  marca VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Supermercados
CREATE TABLE supermercados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SUPERMERCADOS PREFERIDOS POR USUARIO (NUEVO)
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

-- 11. BENEFICIOS BANCARIOS (Complejos)
CREATE TABLE beneficios_bancarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  combinacion_exacta VARCHAR(255) NOT NULL, -- "Santander Visa Black Cuenta Sueldo"
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id),
  porcentaje_descuento DECIMAL(5, 2) NOT NULL, -- 20.00
  limite_mensual DECIMAL(10, 2), -- 20000.00
  dias_semana INTEGER[], -- [3] para miércoles
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. BENEFICIOS SUPERMERCADO UNITARIOS (Simples)
CREATE TABLE beneficios_super_unitarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  supermercado_id UUID REFERENCES supermercados(id),
  porcentaje_descuento DECIMAL(5, 2) NOT NULL, -- 20.00
  categoria_id UUID REFERENCES categorias_productos(id), -- opcional
  producto_id UUID REFERENCES productos(id), -- opcional
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. BENEFICIOS SUPERMERCADO POR CANTIDAD (Reglas complejas)
CREATE TABLE beneficios_super_cantidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  supermercado_id UUID REFERENCES supermercados(id),
  regla_cantidad VARCHAR(100) NOT NULL, -- "2da_unidad_70%", "4x3", "lleve_3_pague_2"
  categoria_id UUID REFERENCES categorias_productos(id), -- opcional
  producto_id UUID REFERENCES productos(id), -- opcional
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. CUPOS USUARIO (Tracking mensual)
CREATE TABLE cupos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  beneficio_bancario_id UUID REFERENCES beneficios_bancarios(id),
  cupo_disponible_mes DECIMAL(10, 2) NOT NULL, -- 20000.00
  cupo_usado_mes DECIMAL(10, 2) DEFAULT 0, -- 5000.00
  mes_año VARCHAR(7) NOT NULL, -- "2024-01"
  actualizado_por VARCHAR(50) DEFAULT 'admin', -- 'admin' | 'usuario'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Carritos X Usuario
CREATE TABLE carritos_x_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  frecuencia_dias INTEGER NOT NULL,
  proxima_notificacion TIMESTAMP WITH TIME ZONE,
  ultima_compra TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(50) DEFAULT 'activo', -- activo, pausado, comprado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. CRITERIOS DE SUSTITUCIÓN
CREATE TABLE criterios_sustitucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  nivel INTEGER NOT NULL, -- 1-4 para ordenamiento
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Productos X Carrito (con criterio de sustitución)
CREATE TABLE productos_x_carrito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER DEFAULT 1,
  criterio_sustitucion_id UUID REFERENCES criterios_sustitucion(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. PRODUCTOS SIMILARES (Para sugerencias)
CREATE TABLE productos_similares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_original_id UUID REFERENCES productos(id),
  producto_similar_id UUID REFERENCES productos(id),
  nivel_similitud DECIMAL(3, 2) NOT NULL, -- 0.00 a 1.00
  diferencia_precio_promedio DECIMAL(5, 2), -- diferencia en %
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Notificaciones
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  tipo VARCHAR(50) NOT NULL, -- email, whatsapp
  titulo VARCHAR(255) NOT NULL,
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
  supermercado_id UUID REFERENCES supermercados(id),
  total_ahorro DECIMAL(10, 2),
  total_gastado DECIMAL(10, 2),
  fecha_compra TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. APLICACIÓN BENEFICIOS (Historial de aplicación)
CREATE TABLE aplicacion_beneficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  compra_id UUID REFERENCES historial_compras(id),
  beneficio_bancario_id UUID REFERENCES beneficios_bancarios(id),
  beneficio_super_unitario_id UUID REFERENCES beneficios_super_unitarios(id),
  beneficio_super_cantidad_id UUID REFERENCES beneficios_super_cantidad(id),
  ahorro_aplicado DECIMAL(10, 2) NOT NULL,
  fecha_aplicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. SUGERENCIAS DE SUSTITUCIÓN (Historial de sugerencias)
CREATE TABLE sugerencias_sustitucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  producto_original_id UUID REFERENCES productos(id),
  producto_sugerido_id UUID REFERENCES productos(id),
  ahorro_estimado DECIMAL(10, 2) NOT NULL,
  criterio_aplicado_id UUID REFERENCES criterios_sustitucion(id),
  aceptada BOOLEAN DEFAULT false,
  fecha_sugerencia TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_carritos_usuario ON carritos_x_usuario(usuario_id);
CREATE INDEX idx_carritos_proxima_notificacion ON carritos_x_usuario(proxima_notificacion);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_beneficios_bancarios_fechas ON beneficios_bancarios(fecha_inicio, fecha_fin);
CREATE INDEX idx_beneficios_super_unitarios_fechas ON beneficios_super_unitarios(fecha_inicio, fecha_fin);
CREATE INDEX idx_beneficios_super_cantidad_fechas ON beneficios_super_cantidad(fecha_inicio, fecha_fin);
CREATE INDEX idx_cupos_usuario_mes ON cupos_usuario(usuario_id, mes_año);
CREATE INDEX idx_notificaciones_enviada ON notificaciones(enviada);
CREATE INDEX idx_historial_usuario ON historial_compras(usuario_id);
CREATE INDEX idx_productos_similares_original ON productos_similares(producto_original_id);
CREATE INDEX idx_sugerencias_usuario ON sugerencias_sustitucion(usuario_id);
CREATE INDEX idx_supermercados_preferidos_usuario ON supermercados_preferidos_usuario(usuario_id);

-- Row Level Security (RLS) Policies
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacion_beneficios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugerencias_sustitucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados_preferidos_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY "Users can view own data" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para carritos
CREATE POLICY "Users can view own carritos" ON carritos_x_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can manage own carritos" ON carritos_x_usuario
  FOR ALL USING (auth.uid() = usuario_id);

-- Políticas RLS para productos en carrito
CREATE POLICY "Users can view own productos in carrito" ON productos_x_carrito
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE id = productos_x_carrito.carrito_id 
      AND usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own productos in carrito" ON productos_x_carrito
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE id = productos_x_carrito.carrito_id 
      AND usuario_id = auth.uid()
    )
  );

-- Políticas RLS para medios de pago del usuario
CREATE POLICY "Users can view own medios de pago" ON medios_de_pago_x_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can manage own medios de pago" ON medios_de_pago_x_usuario
  FOR ALL USING (auth.uid() = usuario_id);

-- Políticas RLS para cupos del usuario
CREATE POLICY "Users can view own cupos" ON cupos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can update own cupos" ON cupos_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas RLS para notificaciones
CREATE POLICY "Users can view own notificaciones" ON notificaciones
  FOR SELECT USING (auth.uid() = usuario_id);

-- Políticas RLS para historial
CREATE POLICY "Users can view own historial" ON historial_compras
  FOR SELECT USING (auth.uid() = usuario_id);

-- Políticas RLS para aplicación de beneficios
CREATE POLICY "Users can view own aplicacion beneficios" ON aplicacion_beneficios
  FOR SELECT USING (auth.uid() = usuario_id);

-- Políticas RLS para sugerencias de sustitución
CREATE POLICY "Users can view own sugerencias" ON sugerencias_sustitucion
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can manage own sugerencias" ON sugerencias_sustitucion
  FOR ALL USING (auth.uid() = usuario_id);

-- Políticas RLS para supermercados preferidos
CREATE POLICY "Users can view own supermercados preferidos" ON supermercados_preferidos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can manage own supermercados preferidos" ON supermercados_preferidos_usuario
  FOR ALL USING (auth.uid() = usuario_id);

-- Datos iniciales
INSERT INTO categorias_productos (nombre, descripcion) VALUES
('Carnes', 'Carnes rojas, blancas y embutidos'),
('Lácteos', 'Leche, quesos, yogures'),
('Frutas y Verduras', 'Productos frescos'),
('Limpieza', 'Productos de limpieza e higiene'),
('Bebidas', 'Bebidas alcohólicas y no alcohólicas');

INSERT INTO segmentos (nombre, descripcion) VALUES
('Cuenta Sueldo', 'Cuenta básica de sueldo'),
('Premium', 'Cuenta premium con beneficios'),
('Black', 'Cuenta black con máximos beneficios'),
('Gold', 'Cuenta gold con beneficios intermedios');

INSERT INTO medios_de_pago (tipo, banco, nombre) VALUES
('Visa', 'Santander', 'Visa Santander'),
('Mastercard', 'Galicia', 'Mastercard Galicia'),
('American Express', 'Amex', 'American Express'),
('Mercado Pago', 'Mercado Pago', 'Mercado Pago'),
('Ualá', 'Ualá', 'Ualá');

INSERT INTO supermercados (nombre) VALUES
('Disco'),
('Carrefour'),
('Jumbo'),
('Coto'),
('Día'),
('Chango Más');

-- CRITERIOS DE SUSTITUCIÓN
INSERT INTO criterios_sustitucion (nombre, descripcion, nivel) VALUES
('Exacto', 'No me cambio de este producto', 1),
('Calidad Similar', 'Me da lo mismo opciones de calidad similar', 2),
('Precio Significativo', 'Si hay alguno similar en calidad con diferencia de precio significativa me cambio', 3),
('Solo Precio', 'No me interesa la marca, solamente quiero gastar lo menos posible', 4);

-- Ejemplos de beneficios bancarios complejos
INSERT INTO beneficios_bancarios (nombre, combinacion_exacta, medio_de_pago_id, segmento_id, porcentaje_descuento, limite_mensual, dias_semana, fecha_inicio, fecha_fin) VALUES
('Santander Visa Black - Cuenta Sueldo', 'Santander Visa Black Cuenta Sueldo', 
 (SELECT id FROM medios_de_pago WHERE nombre = 'Visa Santander'),
 (SELECT id FROM segmentos WHERE nombre = 'Cuenta Sueldo'),
 20.00, 20000.00, ARRAY[3], '2024-01-01', '2024-12-31');

-- Ejemplos de beneficios de supermercado unitarios
INSERT INTO beneficios_super_unitarios (nombre, supermercado_id, porcentaje_descuento, categoria_id, fecha_inicio, fecha_fin) VALUES
('20% descuento en carnes', 
 (SELECT id FROM supermercados WHERE nombre = 'Disco'),
 20.00, 
 (SELECT id FROM categorias_productos WHERE nombre = 'Carnes'),
 '2024-01-01', '2024-12-31');

-- Ejemplos de beneficios por cantidad
INSERT INTO beneficios_super_cantidad (nombre, supermercado_id, regla_cantidad, categoria_id, fecha_inicio, fecha_fin) VALUES
('2da unidad al 70%', 
 (SELECT id FROM supermercados WHERE nombre = 'Carrefour'),
 '2da_unidad_70%', 
 (SELECT id FROM categorias_productos WHERE nombre = 'Lácteos'),
 '2024-01-01', '2024-12-31'),
('4x3 en limpieza', 
 (SELECT id FROM supermercados WHERE nombre = 'Jumbo'),
 '4x3', 
 (SELECT id FROM categorias_productos WHERE nombre = 'Limpieza'),
 '2024-01-01', '2024-12-31');

-- PASO 3: Configurar Row Level Security (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos_x_medio_de_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_supermercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_bancarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_super_unitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_super_cantidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_sustitucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_similares ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugerencias_sustitucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_sugerencias_aceptadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupos_mensuales_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados_preferidos_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Users can view own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para MEDIOS_DE_PAGO_X_USUARIO
CREATE POLICY "Users can view own payment methods" ON medios_de_pago_x_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own payment methods" ON medios_de_pago_x_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own payment methods" ON medios_de_pago_x_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own payment methods" ON medios_de_pago_x_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para SUPERMERCADOS_PREFERIDOS_USUARIO
CREATE POLICY "Users can view own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own preferred supermarkets" ON supermercados_preferidos_usuario
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

-- Políticas para CUPOS_MENSUALES_USUARIO
CREATE POLICY "Users can view own monthly quotas" ON cupos_mensuales_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own monthly quotas" ON cupos_mensuales_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own monthly quotas" ON cupos_mensuales_usuario
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

-- Políticas para HISTORIAL_SUGERENCIAS_ACEPTADAS
CREATE POLICY "Users can view own accepted suggestions" ON historial_sugerencias_aceptadas
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own accepted suggestions" ON historial_sugerencias_aceptadas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Mensaje de confirmación
SELECT 'SABU Database V4 - Modelo Simplificado (sin geolocalización) creado exitosamente!' as status;
