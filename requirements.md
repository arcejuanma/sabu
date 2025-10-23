# SABU - Requirements del MVP

## 🎯 Problemas Core a Resolver

### **1. Gestión de Usuarios**
- **Registro de usuarios** con datos básicos
- **Datos requeridos**: nombre, teléfono, email, dirección
- **Propósito**: Buscar supermercados cercanos al usuario
- **Autenticación** segura con Supabase

### **2. Gestión de Carritos**
- **Crear carritos** (múltiples por usuario, sin límite)
- **Agregar productos** a carritos
- **Frecuencia de compra** (ej: "jabón líquido cada 2 meses")
- **Editar/eliminar** carritos
- **Estados**: activo, comprado, pausado

### **3. Medios de Pago**
- **Agregar tarjetas** del usuario
- **Segmentos bancarios** (cuenta sueldo, black, premium)
- **Validación**: Backoffice carga beneficios por boca de expendio y tarjeta
- **Tipos**: Visa, Mastercard, AMEX, Santander, Galicia

### **4. Proceso Batch de Precios**
- **Endpoint público** para disparar el proceso
- **Frecuencia**: Cada 2 horas (disparado externamente)
- **Funcionalidad**:
  - Buscar precios de productos en supermercados
  - Aplicar promociones bancarias
  - Calcular ahorro potencial
  - Generar notificaciones

### **5. Sistema de Notificaciones**
- **Enviar email** con mejores ofertas
- **Enviar WhatsApp** (futuro)
- **Marcar como enviada** la notificación
- **Evitar spam**: No reenviar si ya compró

### **6. Gestión de Compras**
- **Marcar carrito como comprado**
- **Historial de compras**
- **Evitar notificaciones** por productos ya comprados
- **Tracking** de ahorros reales

## 📊 Estructura de Datos

### **Usuarios**
```json
{
  "id": "uuid",
  "nombre": "string",
  "telefono": "string",
  "email": "string",
  "direccion": "string",
  "created_at": "timestamp"
}
```

### **Carritos**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "nombre": "string",
  "frecuencia_dias": "number",
  "estado": "activo|comprado|pausado",
  "created_at": "timestamp"
}
```

### **Productos en Carrito**
```json
{
  "id": "uuid",
  "carrito_id": "uuid",
  "producto_id": "uuid",
  "cantidad": "number",
  "frecuencia_dias": "number"
}
```

### **Medios de Pago**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "tipo": "visa|mastercard|amex",
  "banco": "santander|galicia",
  "segmento": "cuenta_sueldo|black|premium",
  "numero": "string",
  "created_at": "timestamp"
}
```

### **Promociones**
```json
{
  "id": "uuid",
  "supermercado": "string",
  "producto_id": "uuid",
  "tipo_tarjeta": "string",
  "banco": "string",
  "segmento": "string",
  "descuento_porcentaje": "number",
  "descuento_monto": "number",
  "monto_maximo": "number",
  "fecha_inicio": "date",
  "fecha_fin": "date",
  "dias_vigencia": "array"
}
```

### **Notificaciones**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "carrito_id": "uuid",
  "tipo": "email|whatsapp",
  "contenido": "string",
  "enviada": "boolean",
  "fecha_envio": "timestamp"
}
```

## 🔄 Flujo del Proceso Batch

### **1. Trigger del Proceso**
- **Endpoint**: `POST /api/batch/process-prices`
- **Frecuencia**: Cada 2 horas (externo)
- **Autenticación**: API key

### **2. Proceso Interno**
1. **Obtener usuarios** activos
2. **Obtener carritos** activos de cada usuario
3. **Obtener productos** de cada carrito
4. **Buscar precios** en supermercados
5. **Aplicar promociones** bancarias
6. **Calcular ahorro** potencial
7. **Generar notificaciones** si hay ahorro
8. **Marcar como enviada**

### **3. Notificaciones**
- **Email**: Con mejores ofertas
- **WhatsApp**: Futuro
- **Contenido**: Productos, supermercados, ahorro, tarjetas recomendadas

## 🚫 Limitaciones del MVP

### **No Incluir**
- **Cron jobs** internos (usar endpoint externo)
- **Productos no disponibles** (no es MVP)
- **Geolocalización** avanzada
- **APIs de bancos** (carga manual)
- **APIs de supermercados** (carga manual)

### **Incluir**
- **Carga manual** de productos y precios
- **Carga manual** de promociones bancarias
- **Backoffice** para administrar datos
- **Notificaciones** básicas (email)

## 🎯 Objetivos del MVP

### **Funcionalidad Core**
1. **Usuario** puede registrarse y crear carritos
2. **Usuario** puede agregar medios de pago
3. **Sistema** busca precios automáticamente
4. **Sistema** envía notificaciones con ahorros
5. **Usuario** puede marcar compras realizadas

### **Métricas de Éxito**
- **Usuarios registrados** > 0
- **Carritos creados** > 0
- **Notificaciones enviadas** > 0
- **Compras marcadas** > 0

## 🔧 Consideraciones Técnicas

### **Base de Datos**
- **Supabase** para almacenamiento
- **Row Level Security** habilitado
- **Relaciones** entre usuarios, carritos, productos

### **Backend**
- **Endpoint batch** para procesamiento
- **Validaciones** de datos
- **Logs** de procesamiento

### **Frontend**
- **Mobile-first** design
- **Interfaz intuitiva** para usuarios
- **Gestión de carritos** fácil
- **Historial** de compras

### **Notificaciones**
- **Email** con templates
- **WhatsApp** (futuro)
- **Tracking** de envíos
- **Evitar spam** automático
