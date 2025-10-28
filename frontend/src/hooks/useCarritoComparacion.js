import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// =====================================================
// HOOK: RESUMEN DE CARRITO POR SUPERMERCADO
// =====================================================
// Hook para obtener resumen rápido de todos los supermercados
// Optimizado para carga inicial rápida

export const useResumenCarrito = (carritoId) => {
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (carritoId) {
      fetchResumen();
    }
  }, [carritoId]);

  const fetchResumen = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vista_resumen_carrito_supermercados')
        .select('*')
        .eq('carrito_id', carritoId)
        .order('precio_total', { ascending: true });

      if (error) throw error;

      setResumen(data || []);
    } catch (err) {
      console.error('Error fetching resumen carrito:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshResumen = () => {
    fetchResumen();
  };

  return { 
    resumen, 
    loading, 
    error, 
    refreshResumen 
  };
};

// =====================================================
// HOOK: DETALLE DE CARRITO POR SUPERMERCADO
// =====================================================
// Hook para obtener detalle producto por producto
// Carga bajo demanda para optimizar performance

export const useDetalleCarrito = (carritoId, supermercadoId) => {
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetalle = async () => {
    if (!carritoId || !supermercadoId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vista_detalle_carrito_supermercado')
        .select('*')
        .eq('carrito_id', carritoId)
        .eq('supermercado_id', supermercadoId)
        .order('producto_nombre', { ascending: true });

      if (error) throw error;

      // Debug: verificar datos recibidos
      console.log('🔍 useDetalleCarrito - Datos de la vista:', {
        data: data,
        cantidad: data?.length || 0,
        primerProducto: data?.[0]
      });

      setDetalle(data || []);
    } catch (err) {
      console.error('Error fetching detalle carrito:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearDetalle = () => {
    setDetalle([]);
    setError(null);
  };

  return { 
    detalle, 
    loading, 
    error, 
    fetchDetalle, 
    clearDetalle 
  };
};

// =====================================================
// HOOK: COMPARACIÓN RÁPIDA
// =====================================================
// Hook para obtener comparación optimizada con rankings
// Ideal para pantalla inicial de comparación

export const useComparacionRapida = (carritoId) => {
  const [comparacion, setComparacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (carritoId) {
      fetchComparacion();
    }
  }, [carritoId]);

  const fetchComparacion = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vista_comparacion_rapida')
        .select('*')
        .eq('carrito_id', carritoId)
        .order('ranking_precio', { ascending: true });

      if (error) throw error;

      setComparacion(data || []);
    } catch (err) {
      console.error('Error fetching comparacion rapida:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshComparacion = () => {
    fetchComparacion();
  };

  return { 
    comparacion, 
    loading, 
    error, 
    refreshComparacion 
  };
};

// =====================================================
// HOOK: ESTADÍSTICAS DE CARRITO
// =====================================================
// Hook para obtener estadísticas generales del carrito
// Útil para mostrar métricas en el dashboard

export const useEstadisticasCarrito = (carritoId) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (carritoId) {
      fetchEstadisticas();
    }
  }, [carritoId]);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vista_resumen_carrito_supermercados')
        .select('*')
        .eq('carrito_id', carritoId);

      if (error) throw error;

      if (data && data.length > 0) {
        const stats = {
          totalSupermercados: data.length,
          precioMinimo: Math.min(...data.map(s => s.precio_total)),
          precioMaximo: Math.max(...data.map(s => s.precio_total)),
          precioPromedio: data.reduce((sum, s) => sum + s.precio_total, 0) / data.length,
          supermercadoMasBarato: data.find(s => s.precio_total === Math.min(...data.map(s => s.precio_total))),
          supermercadoMasCompleto: data.find(s => s.porcentaje_disponibilidad === Math.max(...data.map(s => s.porcentaje_disponibilidad))),
          ahorroMaximo: Math.max(...data.map(s => s.ahorro_estimado || 0))
        };
        
        setEstadisticas(stats);
      }
    } catch (err) {
      console.error('Error fetching estadisticas carrito:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { 
    estadisticas, 
    loading, 
    error, 
    refreshEstadisticas: fetchEstadisticas 
  };
};

// =====================================================
// UTILIDADES PARA FORMATEO
// =====================================================

export const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
};

export const formatearPorcentaje = (porcentaje) => {
  return `${porcentaje.toFixed(1)}%`;
};

export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'COMPLETO':
      return 'text-green-600 bg-green-100';
    case 'PARCIAL':
      return 'text-yellow-600 bg-yellow-100';
    case 'LIMITADO':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getEstadoIcono = (estado) => {
  switch (estado) {
    case 'COMPLETO':
      return '✅';
    case 'PARCIAL':
      return '⚠️';
    case 'LIMITADO':
      return '❌';
    default:
      return '❓';
  }
};

export const getProductoEstadoColor = (estado) => {
  switch (estado) {
    case 'MAS_BARATO':
      return 'text-green-600 bg-green-100';
    case 'PRECIO_NORMAL':
      return 'text-blue-600 bg-blue-100';
    case 'MAS_CARO':
      return 'text-red-600 bg-red-100';
    case 'FALTANTE':
      return 'text-gray-600 bg-gray-100';
    case 'SIN_PRECIO':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getProductoEstadoIcono = (estado) => {
  switch (estado) {
    case 'MAS_BARATO':
      return '💰';
    case 'PRECIO_NORMAL':
      return '📊';
    case 'MAS_CARO':
      return '📈';
    case 'FALTANTE':
      return '❌';
    case 'SIN_PRECIO':
      return '❓';
    default:
      return '❓';
  }
};
