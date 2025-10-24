# 🔄 Criterios de Sustitución - SABU

## 🎯 ¿Qué son los Criterios de Sustitución?

Los criterios de sustitución permiten que el usuario defina **qué tan flexible es** con cada producto en su carrito. Esto es clave para maximizar ahorros sin comprometer sus preferencias.

## 📊 Niveles de Sustitución

### **Nivel 1: Exacto** 🔒
- **Descripción**: "No me cambio de este producto"
- **Comportamiento**: Solo busca el producto exacto
- **Ahorro**: Solo descuentos directos, no sustitución
- **Ejemplo**: "Solo quiero Coca-Cola, no Pepsi"

### **Nivel 2: Calidad Similar** ⚖️
- **Descripción**: "Me da lo mismo opciones de calidad similar"
- **Comportamiento**: Busca productos de calidad equivalente
- **Ahorro**: Sustitución por marcas premium similares
- **Ejemplo**: "Coca-Cola o Sprite, pero de calidad similar"

### **Nivel 3: Precio Significativo** 💰
- **Descripción**: "Si hay alguno similar en calidad con diferencia de precio significativa me cambio"
- **Comportamiento**: Busca productos similares con ahorro significativo
- **Ahorro**: Sustitución por productos más baratos con ahorro >20%
- **Ejemplo**: "Coca-Cola está bien, pero si hay algo similar 30% más barato, lo tomo"

### **Nivel 4: Solo Precio** 🏷️
- **Descripción**: "No me interesa la marca, solamente quiero gastar lo menos posible"
- **Comportamiento**: Busca la opción más barata disponible
- **Ahorro**: Máximo ahorro posible, sin importar marca
- **Ejemplo**: "Cualquier gaseosa, la más barata"

## 🛒 Implementación en el Carrito

### **Interfaz de Usuario:**
```
Producto: Coca-Cola 2L
Criterio: [Dropdown con 4 opciones]
- 🔒 Exacto
- ⚖️ Calidad Similar  
- 💰 Precio Significativo
- 🏷️ Solo Precio
```

### **Lógica de Búsqueda:**
1. **Nivel 1**: Solo Coca-Cola 2L
2. **Nivel 2**: Coca-Cola, Sprite, Fanta (misma calidad)
3. **Nivel 3**: Cualquier gaseosa con ahorro >20%
4. **Nivel 4**: La gaseosa más barata disponible

## 🔍 Algoritmo de Sugerencias

### **Paso 1: Identificar Productos Similares**
```sql
-- Buscar productos similares por categoría
SELECT p.*, ps.nivel_similitud, ps.diferencia_precio_promedio
FROM productos p
JOIN productos_similares ps ON p.id = ps.producto_similar_id
WHERE ps.producto_original_id = 'producto-uuid'
AND ps.activo = true
ORDER BY ps.nivel_similitud DESC;
```

### **Paso 2: Aplicar Criterio del Usuario**
```sql
-- Filtrar según criterio de sustitución
CASE criterio_sustitucion_id
  WHEN 1 THEN -- Exacto: solo producto original
  WHEN 2 THEN -- Calidad similar: similitud > 0.8
  WHEN 3 THEN -- Precio significativo: ahorro > 20%
  WHEN 4 THEN -- Solo precio: ordenar por precio
END
```

### **Paso 3: Calcular Ahorro**
```sql
-- Calcular ahorro potencial
SELECT 
  producto_sugerido,
  precio_original,
  precio_sugerido,
  (precio_original - precio_sugerido) as ahorro_absoluto,
  ((precio_original - precio_sugerido) / precio_original * 100) as ahorro_porcentual
FROM productos_sugeridos
WHERE ahorro_porcentual >= criterio_minimo;
```

## 📱 Flujo de Usuario

### **1. Agregar Producto al Carrito:**
```
Usuario selecciona: "Coca-Cola 2L"
Sistema pregunta: "¿Qué tan flexible sos con este producto?"
Opciones:
- 🔒 Solo este producto
- ⚖️ Calidad similar
- 💰 Ahorro significativo
- 🏷️ Lo más barato
```

### **2. Generar Sugerencias:**
```
Sistema busca productos según criterio
Muestra opciones con ahorro estimado
Usuario puede aceptar o rechazar
```

### **3. Aplicar Beneficios:**
```
Sistema calcula beneficios aplicables
Combina descuentos + sustitución
Muestra ahorro total
```

## 🎯 Casos de Uso Reales

### **Caso 1: Usuario Exigente**
```
Productos: Coca-Cola, Leche La Serenísima, Pan Bimbo
Criterio: Exacto para todos
Resultado: Solo descuentos directos, sin sustitución
Ahorro: 15% promedio
```

### **Caso 2: Usuario Flexible**
```
Productos: Gaseosa, Leche, Pan
Criterio: Solo Precio para todos
Resultado: Productos más baratos disponibles
Ahorro: 35% promedio
```

### **Caso 3: Usuario Mixto**
```
Productos: Coca-Cola (Exacto), Leche (Calidad Similar), Pan (Solo Precio)
Resultado: Combinación de criterios
Ahorro: 25% promedio
```

## 🔧 Configuración Técnica

### **Tabla: criterios_sustitucion**
```sql
id, nombre, descripcion, nivel, activo
1, "Exacto", "No me cambio de este producto", 1, true
2, "Calidad Similar", "Me da lo mismo opciones de calidad similar", 2, true
3, "Precio Significativo", "Si hay alguno similar con diferencia de precio significativa me cambio", 3, true
4, "Solo Precio", "No me interesa la marca, solamente quiero gastar lo menos posible", 4, true
```

### **Tabla: productos_x_carrito (ACTUALIZADA)**
```sql
id, carrito_id, producto_id, cantidad, criterio_sustitucion_id
```

### **Tabla: productos_similares (NUEVA)**
```sql
id, producto_original_id, producto_similar_id, nivel_similitud, diferencia_precio_promedio
```

### **Tabla: sugerencias_sustitucion (NUEVA)**
```sql
id, usuario_id, carrito_id, producto_original_id, producto_sugerido_id, ahorro_estimado, criterio_aplicado_id, aceptada
```

## 🚀 Ventajas del Sistema

### **✅ Para el Usuario:**
- **Control total** sobre sus preferencias
- **Ahorro personalizado** según flexibilidad
- **Transparencia** en las sugerencias
- **Aprendizaje** de sus patrones de compra

### **✅ Para el Negocio:**
- **Mayor ahorro** para usuarios flexibles
- **Retención** de usuarios exigentes
- **Datos valiosos** sobre preferencias
- **Diferenciación** de la competencia

### **✅ Para el MVP:**
- **Funcionalidad única** en el mercado
- **Fácil de implementar** gradualmente
- **Escalable** para casos complejos
- **Diferenciador clave** para inversores

## 📊 Métricas Importantes

### **Por Usuario:**
- Criterio más usado por producto
- Ahorro promedio por criterio
- Tasa de aceptación de sugerencias
- Evolución de criterios en el tiempo

### **Por Producto:**
- Productos más sustituibles
- Nivel de similitud promedio
- Ahorro potencial por sustitución
- Patrones de sustitución por categoría

## 🎯 Próximos Pasos

1. **Implementar interfaz** de selección de criterios
2. **Desarrollar algoritmo** de sugerencias
3. **Crear base de datos** de productos similares
4. **Implementar cálculo** de ahorro
5. **Agregar métricas** de seguimiento

¡Este sistema de criterios de sustitución será un diferenciador clave para SABU!
