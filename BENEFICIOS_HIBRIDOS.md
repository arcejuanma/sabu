# 🎯 Modelo Híbrido de Beneficios - SABU

## 📊 Estructura de Beneficios

### **1. Beneficios Bancarios (Complejos)**
**Tabla:** `beneficios_bancarios`

**Características:**
- Combinación exacta: "Santander Visa Black Cuenta Sueldo"
- Días específicos: Solo miércoles [3]
- Porcentaje: 20% de descuento
- Límite mensual: $20,000
- Segmento requerido: Cuenta Sueldo

**Ejemplo Real:**
```sql
INSERT INTO beneficios_bancarios (
  nombre, 
  combinacion_exacta, 
  porcentaje_descuento, 
  limite_mensual, 
  dias_semana
) VALUES (
  'Santander Visa Black - Cuenta Sueldo',
  'Santander Visa Black Cuenta Sueldo',
  20.00,
  20000.00,
  ARRAY[3] -- miércoles
);
```

### **2. Beneficios Supermercado Unitarios (Simples)**
**Tabla:** `beneficios_super_unitarios`

**Características:**
- Descuento por porcentaje: 20% de descuento
- Por categoría o producto específico
- Fechas de vigencia
- Por supermercado

**Ejemplo Real:**
```sql
INSERT INTO beneficios_super_unitarios (
  nombre,
  supermercado_id,
  porcentaje_descuento,
  categoria_id
) VALUES (
  '20% descuento en carnes',
  (SELECT id FROM supermercados WHERE nombre = 'Disco'),
  20.00,
  (SELECT id FROM categorias_productos WHERE nombre = 'Carnes')
);
```

### **3. Beneficios Supermercado por Cantidad (Reglas)**
**Tabla:** `beneficios_super_cantidad`

**Características:**
- Reglas de cantidad: "2da_unidad_70%", "4x3", "lleve_3_pague_2"
- Por categoría o producto específico
- Fechas de vigencia
- Por supermercado

**Ejemplo Real:**
```sql
INSERT INTO beneficios_super_cantidad (
  nombre,
  supermercado_id,
  regla_cantidad,
  categoria_id
) VALUES (
  '2da unidad al 70%',
  (SELECT id FROM supermercados WHERE nombre = 'Carrefour'),
  '2da_unidad_70%',
  (SELECT id FROM categorias_productos WHERE nombre = 'Lácteos')
);
```

## 🎫 Sistema de Cupos por Usuario

### **Tabla:** `cupos_usuario`

**Características:**
- Cupo disponible por mes
- Cupo usado en el mes
- Tracking por usuario y beneficio
- Actualizable por admin o usuario

**Ejemplo:**
```sql
INSERT INTO cupos_usuario (
  usuario_id,
  beneficio_bancario_id,
  cupo_disponible_mes,
  cupo_usado_mes,
  mes_año
) VALUES (
  'usuario-uuid',
  'beneficio-uuid',
  20000.00,
  5000.00,
  '2024-01'
);
```

## 🔄 Flujo de Aplicación de Beneficios

### **Paso 1: Usuario marca carrito como comprado**
1. Selecciona medio de pago usado
2. Sistema busca beneficios aplicables
3. Calcula ahorros posibles
4. Usuario confirma compra

### **Paso 2: Cálculo de Beneficios**
1. **Beneficios Bancarios:**
   - Verificar combinación exacta
   - Verificar día de la semana
   - Verificar cupo disponible
   - Aplicar descuento

2. **Beneficios Supermercado:**
   - Beneficios unitarios por producto/categoría
   - Beneficios por cantidad según reglas
   - Combinar con beneficios bancarios

3. **Actualizar Cupos:**
   - Restar del cupo bancario usado
   - Registrar en historial
   - Actualizar tracking mensual

## 📱 Interfaz de Usuario

### **Pantalla de Cupos:**
- Mostrar cupos disponibles por mes
- Permitir ajuste manual por usuario
- Historial de uso
- Alertas de cupo agotado

### **Pantalla de Compra:**
- Lista de beneficios aplicables
- Cálculo de ahorro total
- Confirmación de medio de pago
- Actualización automática de cupos

## 🎯 Ventajas del Modelo Híbrido

### **✅ Para MVP:**
- Beneficios simples de super funcionan inmediatamente
- Cupos básicos por usuario
- Cálculo manual de ahorros

### **✅ Para Escalado:**
- Beneficios bancarios complejos
- Reglas de cantidad avanzadas
- Tracking automático
- Combinación de beneficios

### **✅ Para Usuarios:**
- Control de cupos mensuales
- Ajuste manual de límites
- Historial de ahorros
- Transparencia total

## 🔧 Implementación por Fases

### **Fase 1 (MVP - 2 semanas):**
- Beneficios unitarios de super
- Cupos básicos por usuario
- Cálculo manual de ahorros
- Interfaz simple

### **Fase 2 (Escalado - 1 semana):**
- Beneficios bancarios complejos
- Reglas de cantidad
- Tracking automático
- Combinación de beneficios

## 📊 Ejemplos de Uso Real

### **Escenario 1: Usuario con Visa Black Santander**
```
Productos: $10,000
Beneficio bancario: 20% (miércoles) = $2,000
Beneficio super: 10% descuento = $1,000
Total ahorro: $3,000
Cupo usado: $2,000 de $20,000
```

### **Escenario 2: Usuario con 2da unidad al 70%**
```
Productos: 2 leches a $100 c/u
Beneficio super: 2da unidad al 70% = $30 ahorro
Total: $170 en lugar de $200
```

## 🚀 Próximos Pasos

1. **Implementar beneficios unitarios** de super
2. **Crear interfaz de cupos** por usuario
3. **Desarrollar cálculo** de ahorros
4. **Agregar beneficios bancarios** complejos
5. **Implementar reglas** de cantidad
