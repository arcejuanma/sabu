-- =====================================================
-- VISTAS PARA COMPARACIÓN DE CARRITOS POR SUPERMERCADO
-- =====================================================
-- Basado en la estructura real de la base de datos
-- Autor: SABU Team
-- Fecha: 2025

-- =====================================================
-- VISTA 1: RESUMEN DE CARRITO POR SUPERMERCADO
-- =====================================================
-- Muestra un resumen rápido de cada supermercado para el carrito
-- Incluye: precio total, productos disponibles, faltantes, etc.

CREATE OR REPLACE VIEW vista_resumen_carrito_supermercados AS
SELECT 
  c.id as carrito_id,
  c.nombre as carrito_nombre,
  s.id as supermercado_id,
  s.nombre as supermercado_nombre,
  '' as supermercado_logo,
  COUNT(pc.producto_id) as total_productos,
  SUM(pc.cantidad) as total_cantidad,
  SUM(pc.cantidad * COALESCE(ps.precio, 0)) as precio_total,
  COUNT(CASE WHEN ps.precio IS NULL THEN 1 END) as productos_faltantes,
  COUNT(CASE WHEN ps.precio IS NOT NULL THEN 1 END) as productos_disponibles,
  ROUND(
    (COUNT(CASE WHEN ps.precio IS NOT NULL THEN 1 END)::numeric / COUNT(pc.producto_id) * 100), 
    2
  ) as porcentaje_disponibilidad,
  -- Indicador de estado
  CASE 
    WHEN COUNT(CASE WHEN ps.precio IS NULL THEN 1 END) = 0 THEN 'COMPLETO'
    WHEN COUNT(CASE WHEN ps.precio IS NULL THEN 1 END) <= COUNT(pc.producto_id) * 0.2 THEN 'PARCIAL'
    ELSE 'LIMITADO'
  END as estado_disponibilidad
FROM carritos_x_usuario c
CROSS JOIN supermercados s
LEFT JOIN productos_x_carrito pc ON c.id = pc.carrito_id
LEFT JOIN productos p ON pc.producto_id = p.id
LEFT JOIN productos_x_supermercado ps ON pc.producto_id = ps.producto_id 
  AND s.id = ps.supermercado_id
WHERE c.activo = true
GROUP BY c.id, c.nombre, s.id, s.nombre, s.activo
ORDER BY c.id, precio_total ASC;

-- =====================================================
-- VISTA 2: DETALLE DE CARRITO POR SUPERMERCADO
-- =====================================================
-- Muestra el detalle producto por producto para un supermercado específico
-- Incluye: precio individual, estado, subtotal, etc.

CREATE OR REPLACE VIEW vista_detalle_carrito_supermercado AS
SELECT 
  c.id as carrito_id,
  c.nombre as carrito_nombre,
  s.id as supermercado_id,
  s.nombre as supermercado_nombre,
  p.id as producto_id,
  p.nombre as producto_nombre,
  p.descripcion as producto_descripcion,
  pc.cantidad,
  ps.precio,
  CASE 
    WHEN ps.precio IS NULL THEN 'FALTANTE'
    WHEN ps.precio = 0 THEN 'SIN_PRECIO'
    ELSE 'DISPONIBLE'
  END as estado_producto,
  (pc.cantidad * COALESCE(ps.precio, 0)) as subtotal
FROM carritos_x_usuario c
CROSS JOIN supermercados s
JOIN productos_x_carrito pc ON c.id = pc.carrito_id
JOIN productos p ON pc.producto_id = p.id
LEFT JOIN productos_x_supermercado ps ON pc.producto_id = ps.producto_id 
  AND s.id = ps.supermercado_id
WHERE c.activo = true
ORDER BY c.id, s.id, p.nombre;

-- =====================================================
-- VISTA 3: COMPARACIÓN RÁPIDA DE PRECIOS
-- =====================================================
-- Vista optimizada para mostrar solo los datos esenciales de comparación
-- Ideal para la pantalla inicial de comparación

CREATE OR REPLACE VIEW vista_comparacion_rapida AS
SELECT 
  carrito_id,
  carrito_nombre,
  supermercado_id,
  supermercado_nombre,
  precio_total,
  productos_disponibles,
  total_productos,
  porcentaje_disponibilidad,
  estado_disponibilidad,
  -- Ranking por precio (1 = más barato)
  ROW_NUMBER() OVER (PARTITION BY carrito_id ORDER BY precio_total ASC) as ranking_precio,
  -- Ranking por disponibilidad (1 = más completo)
  ROW_NUMBER() OVER (PARTITION BY carrito_id ORDER BY porcentaje_disponibilidad DESC) as ranking_disponibilidad
FROM vista_resumen_carrito_supermercados
WHERE productos_disponibles > 0  -- Solo supermercados con productos disponibles
ORDER BY carrito_id, precio_total ASC;

-- =====================================================
-- VISTA 4: ESTADÍSTICAS DE CARRITO
-- =====================================================
-- Vista para obtener estadísticas generales del carrito
-- Útil para mostrar métricas en el dashboard

CREATE OR REPLACE VIEW vista_estadisticas_carrito AS
SELECT 
  carrito_id,
  carrito_nombre,
  COUNT(DISTINCT supermercado_id) as total_supermercados,
  MIN(precio_total) as precio_minimo,
  MAX(precio_total) as precio_maximo,
  ROUND(AVG(precio_total), 2) as precio_promedio,
  MAX(porcentaje_disponibilidad) as mejor_disponibilidad,
  MIN(porcentaje_disponibilidad) as peor_disponibilidad,
  -- Supermercado más barato
  (SELECT supermercado_nombre 
   FROM vista_resumen_carrito_supermercados v2 
   WHERE v2.carrito_id = v1.carrito_id 
   AND v2.precio_total = MIN(v1.precio_total) 
   LIMIT 1) as supermercado_mas_barato,
  -- Supermercado más completo
  (SELECT supermercado_nombre 
   FROM vista_resumen_carrito_supermercados v2 
   WHERE v2.carrito_id = v1.carrito_id 
   AND v2.porcentaje_disponibilidad = MAX(v1.porcentaje_disponibilidad) 
   LIMIT 1) as supermercado_mas_completo
FROM vista_resumen_carrito_supermercados v1
GROUP BY carrito_id, carrito_nombre;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para productos_x_carrito
CREATE INDEX IF NOT EXISTS idx_productos_x_carrito_carrito_id 
ON productos_x_carrito(carrito_id);

-- Índice para productos_x_supermercado
CREATE INDEX IF NOT EXISTS idx_productos_x_supermercado_producto_supermercado 
ON productos_x_supermercado(producto_id, supermercado_id);

-- Índice para carritos_x_usuario activos
CREATE INDEX IF NOT EXISTS idx_carritos_x_usuario_activo 
ON carritos_x_usuario(activo) WHERE activo = true;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON VIEW vista_resumen_carrito_supermercados IS 
'Resumen rápido de carrito por supermercado. Incluye precio total, disponibilidad y estado.';

COMMENT ON VIEW vista_detalle_carrito_supermercado IS 
'Detalle producto por producto para un supermercado específico. Incluye precios individuales.';

COMMENT ON VIEW vista_comparacion_rapida IS 
'Vista optimizada para comparación rápida con rankings de precio y disponibilidad.';

COMMENT ON VIEW vista_estadisticas_carrito IS 
'Estadísticas generales del carrito con métricas de comparación.';

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Obtener resumen de carrito
-- SELECT * FROM vista_resumen_carrito_supermercados WHERE carrito_id = 'uuid-del-carrito';

-- Ejemplo 2: Obtener detalle de supermercado específico
-- SELECT * FROM vista_detalle_carrito_supermercado 
-- WHERE carrito_id = 'uuid-del-carrito' AND supermercado_id = 'uuid-del-supermercado';

-- Ejemplo 3: Comparación rápida con rankings
-- SELECT * FROM vista_comparacion_rapida WHERE carrito_id = 'uuid-del-carrito';

-- Ejemplo 4: Estadísticas del carrito
-- SELECT * FROM vista_estadisticas_carrito WHERE carrito_id = 'uuid-del-carrito';
