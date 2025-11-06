-- =====================================================
-- TABLA: MÉTRICAS POR BÚSQUEDA POR CARRITO
-- =====================================================
-- Esta tabla almacena las métricas de cada búsqueda de compra óptima
-- para análisis y KPIs

-- =====================================================
-- 1. CREAR TABLA
-- =====================================================

DROP TABLE IF EXISTS metricas_por_busqueda_por_carrito CASCADE;

CREATE TABLE metricas_por_busqueda_por_carrito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_carrito UUID NOT NULL REFERENCES carritos_x_usuario(id) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_busqueda DATE NOT NULL DEFAULT CURRENT_DATE,
    precio_minimo_carrito DECIMAL(10, 2) NOT NULL,
    id_supermercado_precio_minimo UUID REFERENCES supermercados(id),
    precio_maximo_carrito DECIMAL(10, 2) NOT NULL,
    id_supermercado_precio_maximo UUID REFERENCES supermercados(id),
    ahorro_maximo DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_metricas_carrito ON metricas_por_busqueda_por_carrito(id_carrito);
CREATE INDEX idx_metricas_usuario ON metricas_por_busqueda_por_carrito(id_usuario);
CREATE INDEX idx_metricas_fecha ON metricas_por_busqueda_por_carrito(fecha_busqueda);
CREATE INDEX idx_metricas_carrito_fecha ON metricas_por_busqueda_por_carrito(id_carrito, fecha_busqueda);

-- =====================================================
-- 2. FUNCIÓN PARA INSERTAR MÉTRICA
-- =====================================================
-- Esta función inserta una métrica solo si no existe
-- un registro para ese día con los mismos precios máximo y mínimo

CREATE OR REPLACE FUNCTION insertar_metrica_busqueda(
    p_id_carrito UUID,
    p_precio_minimo DECIMAL,
    p_id_supermercado_precio_minimo UUID,
    p_precio_maximo DECIMAL,
    p_id_supermercado_precio_maximo UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_usuario UUID;
    v_ahorro_maximo DECIMAL;
    v_fecha_hoy DATE;
    v_existe_registro BOOLEAN;
    v_metrica_id UUID;
BEGIN
    -- Obtener usuario del carrito
    SELECT usuario_id INTO v_id_usuario
    FROM carritos_x_usuario
    WHERE id = p_id_carrito;
    
    IF v_id_usuario IS NULL THEN
        RAISE EXCEPTION 'Carrito no encontrado: %', p_id_carrito;
    END IF;
    
    -- Calcular ahorro máximo
    v_ahorro_maximo := p_precio_maximo - p_precio_minimo;
    v_fecha_hoy := CURRENT_DATE;
    
    -- Verificar si ya existe un registro para hoy con los mismos precios
    SELECT EXISTS (
        SELECT 1
        FROM metricas_por_busqueda_por_carrito
        WHERE id_carrito = p_id_carrito
        AND fecha_busqueda = v_fecha_hoy
        AND precio_minimo_carrito = p_precio_minimo
        AND precio_maximo_carrito = p_precio_maximo
    ) INTO v_existe_registro;
    
    -- Si no existe, insertar
    IF NOT v_existe_registro THEN
        INSERT INTO metricas_por_busqueda_por_carrito (
            id_carrito,
            id_usuario,
            fecha_busqueda,
            precio_minimo_carrito,
            id_supermercado_precio_minimo,
            precio_maximo_carrito,
            id_supermercado_precio_maximo,
            ahorro_maximo
        ) VALUES (
            p_id_carrito,
            v_id_usuario,
            v_fecha_hoy,
            p_precio_minimo,
            p_id_supermercado_precio_minimo,
            p_precio_maximo,
            p_id_supermercado_precio_maximo,
            v_ahorro_maximo
        )
        RETURNING id INTO v_metrica_id;
        
        RETURN v_metrica_id;
    ELSE
        -- Retornar NULL si ya existe (no se insertó)
        RETURN NULL;
    END IF;
END;
$$;

-- =====================================================
-- 3. FUNCIÓN RPC PARA LLAMAR DESDE EL FRONTEND
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_metrica_busqueda_rpc(
    p_id_carrito UUID,
    p_precio_minimo DECIMAL,
    p_id_supermercado_precio_minimo UUID,
    p_precio_maximo DECIMAL,
    p_id_supermercado_precio_maximo UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metrica_id UUID;
BEGIN
    v_metrica_id := insertar_metrica_busqueda(
        p_id_carrito,
        p_precio_minimo,
        p_id_supermercado_precio_minimo,
        p_precio_maximo,
        p_id_supermercado_precio_maximo
    );
    
    IF v_metrica_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', true,
            'inserted', true,
            'metrica_id', v_metrica_id
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'inserted', false,
            'message', 'Ya existe un registro para hoy con los mismos precios'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- =====================================================
-- 4. VISTA PARA CONSULTAR MÉTRICAS
-- =====================================================

CREATE OR REPLACE VIEW vista_metricas_busqueda AS
SELECT 
    m.id,
    m.id_carrito,
    cxu.nombre as nombre_carrito,
    m.id_usuario,
    m.fecha_busqueda,
    m.precio_minimo_carrito,
    m.id_supermercado_precio_minimo,
    s_min.nombre as supermercado_precio_minimo,
    m.precio_maximo_carrito,
    m.id_supermercado_precio_maximo,
    s_max.nombre as supermercado_precio_maximo,
    m.ahorro_maximo,
    ROUND((m.ahorro_maximo / NULLIF(m.precio_maximo_carrito, 0) * 100)::numeric, 2) as porcentaje_ahorro,
    m.fecha_creacion
FROM metricas_por_busqueda_por_carrito m
JOIN carritos_x_usuario cxu ON m.id_carrito = cxu.id
LEFT JOIN supermercados s_min ON m.id_supermercado_precio_minimo = s_min.id
LEFT JOIN supermercados s_max ON m.id_supermercado_precio_maximo = s_max.id
ORDER BY m.fecha_busqueda DESC, m.fecha_creacion DESC;

-- =====================================================
-- 5. POLÍTICAS RLS
-- =====================================================

ALTER TABLE metricas_por_busqueda_por_carrito ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias métricas
DROP POLICY IF EXISTS "usuarios_ven_sus_metricas" ON metricas_por_busqueda_por_carrito;
CREATE POLICY "usuarios_ven_sus_metricas"
ON metricas_por_busqueda_por_carrito
FOR SELECT
USING (id_usuario = auth.uid());

-- Política: Permitir inserción a través de la función (SECURITY DEFINER)
-- Las funciones con SECURITY DEFINER pueden insertar sin política adicional

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE metricas_por_busqueda_por_carrito IS 
'Almacena las métricas de cada búsqueda de compra óptima por carrito';

COMMENT ON FUNCTION insertar_metrica_busqueda IS 
'Inserta una métrica de búsqueda solo si no existe un registro para ese día con los mismos precios máximo y mínimo';

COMMENT ON FUNCTION registrar_metrica_busqueda_rpc IS 
'Función RPC para registrar una métrica de búsqueda desde el frontend';

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Registrar una métrica desde el frontend:
-- SELECT registrar_metrica_busqueda_rpc(
--     'uuid-del-carrito',
--     5000.00,  -- precio_minimo
--     'uuid-supermercado-min',  -- id_supermercado_precio_minimo
--     7000.00,  -- precio_maximo
--     'uuid-supermercado-max'   -- id_supermercado_precio_maximo
-- );

-- Consultar métricas de un usuario:
-- SELECT * FROM vista_metricas_busqueda WHERE id_usuario = 'uuid-del-usuario';

-- Consultar métricas de un carrito:
-- SELECT * FROM vista_metricas_busqueda WHERE id_carrito = 'uuid-del-carrito';

