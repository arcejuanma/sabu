# SABU - Database Structure

## 📊 Tablas de la Base de Datos

### **1. Usuarios**
```sql
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
```

### **2. MediosDePago**
```sql
CREATE TABLE medios_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL, -- visa, mastercard, amex
  banco VARCHAR(100) NOT NULL, -- santander, galicia, etc
  nombre VARCHAR(255) NOT NULL, -- "Visa Santander", "Mastercard Galicia"
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. Segmentos**
```sql
CREATE TABLE segmentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL, -- cuenta_sueldo, black, premium
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **4. SegmentosXMedioDePago**
```sql
CREATE TABLE segmentos_x_medio_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(medio_de_pago_id, segmento_id)
);
```

### **5. MediosDePagoXUsuario**
```sql
CREATE TABLE medios_de_pago_x_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **6. Productos**
```sql
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  marca VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **7. Supermercados**
```sql
CREATE TABLE supermercados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL, -- disco, carrefour, jumbo, coto
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **8. Sucursales**
```sql
CREATE TABLE sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supermercado_id UUID REFERENCES supermercados(id),
  nombre VARCHAR(255) NOT NULL,
  calle VARCHAR(255) NOT NULL,
  altura VARCHAR(10) NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **9. ProductosXSupermercado**
```sql
CREATE TABLE productos_x_supermercado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id),
  supermercado_id UUID REFERENCES supermercados(id),
  precio DECIMAL(10, 2) NOT NULL,
  promocion_activa BOOLEAN DEFAULT false,
  tipo_promocion VARCHAR(50), -- 2do_al_70%, descuento_porcentaje, descuento_monto
  valor_promocion DECIMAL(10, 2),
  fecha_inicio_promocion DATE,
  fecha_fin_promocion DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(producto_id, supermercado_id)
);
```

### **10. Beneficios**
```sql
CREATE TABLE beneficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- descuento_porcentaje, 2do_unidad, descuento_monto
  valor DECIMAL(10, 2) NOT NULL,
  monto_maximo DECIMAL(10, 2),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_vigencia INTEGER[], -- [1,2,3,4,5] para lunes a viernes
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **11. BeneficiosXMedioDePago**
```sql
CREATE TABLE beneficios_x_medio_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficio_id UUID REFERENCES beneficios(id),
  medio_de_pago_id UUID REFERENCES medios_de_pago(id),
  segmento_id UUID REFERENCES segmentos(id), -- NULL si aplica a todos los segmentos
  supermercado_id UUID REFERENCES supermercados(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **12. BeneficiosXProducto**
```sql
CREATE TABLE beneficios_x_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficio_id UUID REFERENCES beneficios(id),
  producto_id UUID REFERENCES productos(id),
  supermercado_id UUID REFERENCES supermercados(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **13. CarritosXUsuario**
```sql
CREATE TABLE carritos_x_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  frecuencia_dias INTEGER NOT NULL, -- cada cuántos días compra
  proxima_notificacion TIMESTAMP WITH TIME ZONE,
  ultima_compra TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(20) DEFAULT 'activo', -- activo, pausado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **14. ProductosXCarrito**
```sql
CREATE TABLE productos_x_carrito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **15. Notificaciones**
```sql
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  carrito_id UUID REFERENCES carritos_x_usuario(id),
  tipo VARCHAR(20) NOT NULL, -- email, whatsapp
  contenido TEXT NOT NULL,
  enviada BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 Relaciones Principales

### **Usuarios → MediosDePago**
- Un usuario puede tener múltiples medios de pago
- Cada medio de pago puede tener diferentes segmentos

### **Usuarios → Carritos**
- Un usuario puede tener múltiples carritos
- Cada carrito tiene una frecuencia de compra

### **Carritos → Productos**
- Un carrito puede tener múltiples productos
- Cada producto tiene una cantidad

### **Productos → Supermercados**
- Un producto puede estar en múltiples supermercados
- Cada supermercado tiene su precio y promociones

### **Beneficios → MediosDePago**
- Un beneficio puede aplicar a múltiples medios de pago
- Puede ser específico por segmento o general

### **Beneficios → Productos**
- Un beneficio puede aplicar a productos específicos
- Puede ser por supermercado

## 📍 Índices Recomendados

```sql
-- Índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_ciudad ON usuarios(ciudad);
CREATE INDEX idx_carritos_usuario ON carritos_x_usuario(usuario_id);
CREATE INDEX idx_carritos_proxima_notificacion ON carritos_x_usuario(proxima_notificacion);
CREATE INDEX idx_productos_x_supermercado_producto ON productos_x_supermercado(producto_id);
CREATE INDEX idx_productos_x_supermercado_supermercado ON productos_x_supermercado(supermercado_id);
CREATE INDEX idx_beneficios_fechas ON beneficios(fecha_inicio, fecha_fin);
CREATE INDEX idx_beneficios_activo ON beneficios(activo);
CREATE INDEX idx_sucursales_supermercado ON sucursales(supermercado_id);
CREATE INDEX idx_sucursales_activo ON sucursales(activo);
```

## 🔒 Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own data" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON usuarios FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own carritos" ON carritos_x_usuario FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can manage own carritos" ON carritos_x_usuario FOR ALL USING (auth.uid() = usuario_id);

CREATE POLICY "Users can view own productos in carrito" ON productos_x_carrito FOR SELECT USING (
  carrito_id IN (SELECT id FROM carritos_x_usuario WHERE usuario_id = auth.uid())
);
```

## 🎯 Consideraciones de Diseño

### **Normalización**
- **3NF** para evitar redundancia
- **Relaciones** claras entre entidades
- **Claves foráneas** para integridad

### **Performance**
- **Índices** en campos de búsqueda frecuente
- **Particionado** por fecha si es necesario
- **Cache** de consultas frecuentes

### **Escalabilidad**
- **UUIDs** para claves primarias
- **Timestamps** para auditoría
- **Soft deletes** con campo activo

### **Seguridad**
- **RLS** habilitado
- **Políticas** por usuario
- **Validaciones** en aplicación
