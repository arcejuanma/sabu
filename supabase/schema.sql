-- SABU Database Schema
-- Crear todas las tablas para el MVP de SABU

-- 1. Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  calle VARCHAR(255) NOT NULL,
  altura VARCHAR(10) NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
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

-- 9. Sucursales
CREATE TABLE sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supermercado_id UUID REFERENCES supermercados(id),
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
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

-- 11. Beneficios
CREATE TABLE beneficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- descuento_porcentaje, descuento_fijo, cashback
  valor DECIMAL(10, 2) NOT NULL,
  monto_maximo DECIMAL(10, 2),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_vigencia INTEGER[],
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Beneficios X Medio de Pago
CREATE TABLE beneficios_x_medio_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficio_id UUID REFERENCES beneficios(id),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id),
  supermercado_id UUID REFERENCES supermercados(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Beneficios X Producto
CREATE TABLE beneficios_x_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficio_id UUID REFERENCES beneficios(id),
  producto_id UUID REFERENCES productos(id),
  supermercado_id UUID REFERENCES supermercados(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Carritos X Usuario
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

-- 15. Productos X Carrito
CREATE TABLE productos_x_carrito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Notificaciones
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

-- 17. Historial de Compras
CREATE TABLE historial_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  supermercado_id UUID REFERENCES supermercados(id),
  sucursal_id UUID REFERENCES sucursales(id),
  total_ahorro DECIMAL(10, 2),
  total_gastado DECIMAL(10, 2),
  fecha_compra TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_ubicacion ON usuarios(lat, lng);
CREATE INDEX idx_carritos_usuario ON carritos_x_usuario(usuario_id);
CREATE INDEX idx_carritos_proxima_notificacion ON carritos_x_usuario(proxima_notificacion);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_sucursales_ubicacion ON sucursales(lat, lng);
CREATE INDEX idx_beneficios_fechas ON beneficios(fecha_inicio, fecha_fin);
CREATE INDEX idx_notificaciones_enviada ON notificaciones(enviada);
CREATE INDEX idx_historial_usuario ON historial_compras(usuario_id);

-- Row Level Security (RLS) Policies
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;

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

-- Políticas RLS para notificaciones
CREATE POLICY "Users can view own notificaciones" ON notificaciones
  FOR SELECT USING (auth.uid() = usuario_id);

-- Políticas RLS para historial
CREATE POLICY "Users can view own historial" ON historial_compras
  FOR SELECT USING (auth.uid() = usuario_id);

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
