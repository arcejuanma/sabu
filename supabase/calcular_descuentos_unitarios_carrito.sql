-- Función para calcular descuentos unitarios de un carrito para un supermercado específico
-- Esta función calcula los descuentos aplicados por promociones_unitarias

-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS calcular_descuentos_unitarios_carrito(UUID, UUID);

CREATE OR REPLACE FUNCTION calcular_descuentos_unitarios_carrito(
  p_carrito_id UUID,
  p_supermercado_id UUID
)
RETURNS TABLE (
  producto_id UUID,
  producto_nombre TEXT,
  cantidad DECIMAL(10, 2),
  precio_base DECIMAL(10, 2),
  subtotal_base DECIMAL(10, 2),
  unidades_con_descuento INTEGER,
  descuento_total DECIMAL(10, 2),
  subtotal_final DECIMAL(10, 2),
  promocion_aplicada JSONB
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_producto RECORD;
  v_promocion RECORD;
  v_cantidad INTEGER;
  v_precio DECIMAL(10, 2);
  v_unidades_con_descuento INTEGER;
  v_descuento_total DECIMAL(10, 2);
  v_hoy DATE;
BEGIN
  v_hoy := CURRENT_DATE;
  
  -- Iterar sobre cada producto del carrito (usar DISTINCT ON para evitar duplicados)
  FOR v_producto IN 
    SELECT DISTINCT ON (pc.producto_id)
      pc.producto_id,
      p.nombre as producto_nombre,
      pc.cantidad,
      ps.precio
    FROM productos_x_carrito pc
    JOIN productos p ON pc.producto_id = p.id
    LEFT JOIN productos_x_supermercado ps ON pc.producto_id = ps.producto_id 
      AND ps.supermercado_id = p_supermercado_id
    WHERE pc.carrito_id = p_carrito_id
      AND ps.precio IS NOT NULL
    ORDER BY pc.producto_id, ps.precio DESC
  LOOP
    v_cantidad := FLOOR(v_producto.cantidad)::INTEGER;
    v_precio := COALESCE(v_producto.precio, 0);
    v_unidades_con_descuento := 0;
    v_descuento_total := 0;
    
    -- Buscar promociones unitarias activas para este producto
    SELECT * INTO v_promocion
    FROM promociones_unitarias
    WHERE producto_id = v_producto.producto_id
      AND supermercado_id = p_supermercado_id
      AND activo = true
      AND fecha_inicio <= v_hoy
      AND fecha_fin >= v_hoy
    LIMIT 1;
    
    -- Si hay promoción, calcular descuento
    IF v_promocion.id IS NOT NULL THEN
      -- Calcular unidades con descuento según unidad_descuento
      -- unidad_descuento = 1: todas las unidades tienen descuento
      -- unidad_descuento = 2: 2da, 4ta, 6ta... tienen descuento
      -- unidad_descuento = 3: 3ra, 6ta, 9na... tienen descuento
      FOR i IN 1..v_cantidad LOOP
        IF i % v_promocion.unidad_descuento = 0 THEN
          v_unidades_con_descuento := v_unidades_con_descuento + 1;
        END IF;
      END LOOP;
      
      -- Respetar límite de unidades si existe
      IF v_promocion.limite_unidades IS NOT NULL THEN
        v_unidades_con_descuento := LEAST(v_unidades_con_descuento, v_promocion.limite_unidades);
      END IF;
      
      -- Calcular descuento total
      IF v_unidades_con_descuento > 0 THEN
        v_descuento_total := v_precio * v_unidades_con_descuento * (v_promocion.descuento_porcentaje / 100);
      END IF;
    END IF;
    
    -- Retornar resultado
    RETURN QUERY SELECT 
      v_producto.producto_id,
      v_producto.producto_nombre::TEXT,
      v_producto.cantidad,
      v_precio as precio_base,
      (v_precio * v_cantidad) as subtotal_base,
      v_unidades_con_descuento,
      v_descuento_total,
      (v_precio * v_cantidad - v_descuento_total) as subtotal_final,
      CASE 
        WHEN v_promocion.id IS NOT NULL THEN
          jsonb_build_object(
            'id', v_promocion.id,
            'descripcion', v_promocion.descripcion,
            'descuento_porcentaje', v_promocion.descuento_porcentaje,
            'unidad_descuento', v_promocion.unidad_descuento,
            'unidades', v_unidades_con_descuento
          )
        ELSE NULL
      END as promocion_aplicada;
  END LOOP;
  
  RETURN;
END;
$$;

-- Comentario sobre la función
COMMENT ON FUNCTION calcular_descuentos_unitarios_carrito IS 
'Calcula los descuentos unitarios aplicados por promociones_unitarias para un carrito en un supermercado específico. 
La lógica: unidad_descuento=1 aplica a todas las unidades, unidad_descuento=2 aplica a 2da, 4ta, 6ta... etc.';

