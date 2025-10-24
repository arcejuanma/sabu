# 🎯 Modelo Simplificado - SABU V4

## 📊 Cambios Principales

### **❌ Eliminado:**
- **Geolocalización** (lat/lng en usuarios)
- **Sucursales** de supermercados
- **Cálculos de distancia** complejos
- **Direcciones** de usuarios

### **✅ Agregado:**
- **Supermercados preferidos** por usuario
- **Selección manual** de supermercados
- **Modelo más simple** para MVP
- **Menos complejidad** técnica

## 🛒 Nuevo Flujo de Usuario

### **1. Registro Simplificado:**
```
Usuario se registra con:
- Nombre
- Teléfono  
- Email
- Selecciona supermercados preferidos
```

### **2. Selección de Supermercados:**
```
Pantalla: "¿En qué supermercados querés que busquemos ofertas?"
Opciones:
☑️ Disco
☑️ Carrefour  
☑️ Jumbo
☑️ Coto
☐ Día
☐ Chango Más
```

### **3. Búsqueda de Ofertas:**
```
Sistema busca ofertas solo en:
- Supermercados seleccionados por el usuario
- Sin cálculos de distancia
- Sin geolocalización
```

## 🏗️ Estructura de Base de Datos

### **Tabla: usuarios (SIMPLIFICADA)**
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  -- ❌ Eliminado: calle, altura, codigo_postal, ciudad, lat, lng
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabla: supermercados_preferidos_usuario (NUEVA)**
```sql
CREATE TABLE supermercados_preferidos_usuario (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  supermercado_id UUID REFERENCES supermercados(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **❌ Eliminada: sucursales**
Ya no necesitamos tabla de sucursales porque no hacemos geolocalización.

## 🎯 Ventajas del Modelo Simplificado

### **✅ Para el MVP:**
- **Menos complejidad** técnica
- **Desarrollo más rápido** (2-3 semanas)
- **Menos bugs** potenciales
- **Fácil de entender** para estudiantes

### **✅ Para el Usuario:**
- **Control total** sobre supermercados
- **Sin problemas** de geolocalización
- **Funciona** en cualquier ubicación
- **Más privacidad** (no necesita dirección)

### **✅ Para el Negocio:**
- **Menos infraestructura** necesaria
- **Menos costos** de desarrollo
- **Más fácil** de escalar
- **Funciona** en cualquier ciudad

## 📱 Interfaz de Usuario

### **Pantalla de Registro:**
```
1. Nombre: [Campo de texto]
2. Teléfono: [Campo de texto]
3. Email: [Campo de texto]
4. Supermercados preferidos:
   ☑️ Disco
   ☑️ Carrefour
   ☑️ Jumbo
   ☐ Coto
   ☐ Día
   ☐ Chango Más
```

### **Pantalla de Configuración:**
```
Usuario puede cambiar supermercados preferidos:
- Agregar nuevos supermercados
- Quitar supermercados
- Activar/desactivar
```

## 🔄 Flujo de Búsqueda de Ofertas

### **Paso 1: Usuario crea carrito**
```
Productos: Coca-Cola, Leche, Pan
Criterios: Exacto, Calidad Similar, Solo Precio
```

### **Paso 2: Sistema busca ofertas**
```
Solo en supermercados preferidos del usuario:
- Disco: Coca-Cola $100, Leche $80, Pan $50
- Carrefour: Coca-Cola $95, Leche $85, Pan $45
- Jumbo: Coca-Cola $90, Leche $75, Pan $55
```

### **Paso 3: Aplicar beneficios**
```
Beneficios bancarios + supermercado
Calcular ahorro total
Mostrar mejor opción
```

## 🎯 Casos de Uso

### **Caso 1: Usuario de CABA**
```
Preferencias: Disco, Carrefour, Jumbo
Resultado: Busca ofertas en estos 3 supermercados
Sin geolocalización, funciona en cualquier barrio
```

### **Caso 2: Usuario del Interior**
```
Preferencias: Coto, Día
Resultado: Busca ofertas en estos 2 supermercados
Funciona igual que en CABA
```

### **Caso 3: Usuario que se muda**
```
Cambia preferencias: Agrega nuevos supermercados
Resultado: Sistema busca en nuevos supermercados
Sin necesidad de cambiar dirección
```

## 🔧 Implementación Técnica

### **Backend:**
```javascript
// Buscar ofertas solo en supermercados preferidos
const supermercadosPreferidos = await getSupermercadosPreferidos(usuarioId);
const ofertas = await buscarOfertas(productos, supermercadosPreferidos);
```

### **Frontend:**
```jsx
// Selección de supermercados preferidos
<CheckboxGroup>
  {supermercados.map(super => (
    <Checkbox 
      key={super.id}
      value={super.id}
      checked={preferidos.includes(super.id)}
      onChange={toggleSupermercado}
    >
      {super.nombre}
    </Checkbox>
  ))}
</CheckboxGroup>
```

## 📊 Métricas Simplificadas

### **Por Usuario:**
- Supermercados más seleccionados
- Frecuencia de cambio de preferencias
- Ahorro promedio por supermercado

### **Por Supermercado:**
- Usuarios que lo prefieren
- Ofertas más efectivas
- Competencia entre supermercados

## 🚀 Escalabilidad

### **Fase 1 (MVP):**
- Selección manual de supermercados
- Búsqueda simple de ofertas
- Beneficios básicos

### **Fase 2 (Escalado):**
- Geolocalización opcional
- Sucursales cercanas
- Beneficios por ubicación

### **Fase 3 (Avanzado):**
- IA para sugerir supermercados
- Análisis de patrones de compra
- Personalización automática

## 🎯 Próximos Pasos

1. **Implementar** selección de supermercados en registro
2. **Desarrollar** búsqueda de ofertas por preferencias
3. **Crear** interfaz de configuración
4. **Agregar** métricas de supermercados preferidos
5. **Escalar** con geolocalización opcional

## 💡 Ventajas del Enfoque

### **✅ MVP más rápido:**
- Menos desarrollo
- Menos bugs
- Más funcional

### **✅ Mejor UX:**
- Usuario controla todo
- Sin problemas de ubicación
- Más privacidad

### **✅ Escalable:**
- Fácil agregar geolocalización después
- Funciona en cualquier ciudad
- Menos dependencias

¡Este modelo simplificado es perfecto para el MVP de 3 semanas!
