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
  "direccion": {
    "calle": "string",
    "altura": "string",
    "codigo_postal": "string",
    "ciudad": "string"
  },
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
  "proxima_notificacion": "timestamp",
  "ultima_compra": "timestamp",
  "estado": "activo|pausado",
  "created_at": "timestamp"
}
```

### **Productos en Carrito**
```json
{
  "id": "uuid",
  "carrito_id": "uuid",
  "producto_id": "uuid",
  "cantidad": "number"
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

### **Productos por Supermercado**
```json
{
  "id": "uuid",
  "producto_id": "uuid",
  "supermercado": "string",
  "precio": "number",
  "promocion_activa": "boolean",
  "tipo_promocion": "2do_al_70%|descuento_porcentaje|descuento_monto",
  "valor_promocion": "number",
  "fecha_inicio_promocion": "date",
  "fecha_fin_promocion": "date",
  "updated_at": "timestamp"
}
```

### **Beneficios por Supermercado**
```json
{
  "id": "uuid",
  "supermercado": "string",
  "tipo": "descuento_porcentaje|2do_unidad|descuento_monto",
  "valor": "number",
  "producto_id": "uuid",
  "fecha_inicio": "date",
  "fecha_fin": "date",
  "activo": "boolean"
}
```

### **Promociones Bancarias**
```json
{
  "id": "uuid",
  "supermercado": "string",
  "banco": "string",
  "segmento": "string",
  "tipo_tarjeta": "string",
  "descuento_porcentaje": "number",
  "descuento_monto": "number",
  "monto_maximo": "number",
  "fecha_inicio": "date",
  "fecha_fin": "date",
  "dias_vigencia": "array",
  "activo": "boolean"
}
```

### **Sucursales de Supermercados**
```json
{
  "id": "uuid",
  "supermercado": "string",
  "nombre": "string",
  "direccion": {
    "calle": "string",
    "altura": "string",
    "codigo_postal": "string",
    "ciudad": "string"
  },
  "coordenadas": {
    "lat": "number",
    "lng": "number"
  },
  "activo": "boolean"
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
3. **Verificar proxima_notificacion** de cada carrito
4. **Obtener productos** de cada carrito
5. **Buscar precios** en supermercados cercanos (geolocalización)
6. **Aplicar promociones** del supermercado
7. **Aplicar promociones** bancarias
8. **Calcular ahorro** potencial
9. **Generar notificaciones** si hay ahorro
10. **Marcar como enviada**

### **3. Lógica de Notificaciones**
- **Verificar proxima_notificacion** del carrito
- **Calcular distancia** a supermercados
- **Aplicar promociones** por día de la semana
- **Generar contenido** personalizado
- **Actualizar proxima_notificacion** basado en frecuencia_dias

### **4. Contenido de Notificaciones**
- **Productos** con mejor precio
- **Supermercados** cercanos
- **Ahorro** potencial
- **Tarjetas** recomendadas
- **Promociones** activas

## 🔐 Autenticación y Seguridad

### **Autenticación de Usuarios**
- **Supabase Auth** (email/password)
- **No SSO** externo (Google, Facebook, etc.)
- **Registro** con datos básicos requeridos

### **Medios de Pago**
- **No guardar datos** de tarjetas
- **Solo tipo y banco** para elegibilidad de promociones
- **Validación** de elegibilidad por promoción

### **Validaciones de Datos**
- **Email** válido
- **Teléfono** argentino
- **Dirección** completa
- **Coordenadas** válidas

## 📍 Geolocalización

### **Radio de Búsqueda**
- **5km** de radio desde domicilio del usuario
- **Cálculo simple** de distancias (no Google Maps)
- **Fallback**: No preocuparse si no hay supermercados cercanos

### **Sucursales Cercanas**
- **Filtrar** supermercados por radio
- **Ordenar** por distancia
- **Mostrar** solo los más cercanos

## ⚙️ Proceso Batch

### **Configuración**
- **Endpoint público** para disparar
- **Logs** de procesamiento
- **No timeout** específico
- **No retry** automático
- **No fallback** si falla

### **Logs de Procesamiento**
- **Usuarios procesados**
- **Carritos evaluados**
- **Notificaciones enviadas**
- **Errores** encontrados
- **Tiempo** de procesamiento

## 📧 Notificaciones

### **Templates de Email**
- **Guardar** en backend
- **Variables** dinámicas (usuario, productos, ahorro)
- **Formato** HTML básico
- **Personalización** por usuario

### **Contenido de Templates**
- **Saludo** personalizado
- **Productos** con mejor precio
- **Supermercados** cercanos
- **Ahorro** potencial
- **Tarjetas** recomendadas
- **Promociones** activas

## 🏢 Backoffice

### **Administración de Datos**
- **Admin** carga todos los datos
- **No validaciones** automáticas
- **No dashboard** de monitoreo
- **Carga manual** de:
  - Productos por supermercado
  - Promociones bancarias
  - Beneficios por supermercado
  - Sucursales

## 🚫 Limitaciones del MVP

### **No Incluir**
- **Cron jobs** internos (usar endpoint externo)
- **Productos no disponibles** (no es MVP)
- **Geolocalización** avanzada
- **APIs de bancos** (carga manual)
- **APIs de supermercados** (carga manual)
- **SSO** externo
- **Datos de tarjetas** completos
- **Validaciones** automáticas
- **Dashboard** de monitoreo
- **Rate limiting**
- **Cache** de precios
- **Límites** de productos/carritos

### **Incluir**
- **Carga manual** de productos y precios
- **Carga manual** de promociones bancarias
- **Backoffice** para administrar datos
- **Notificaciones** básicas (email)
- **Templates** de email
- **Logs** de procesamiento

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
