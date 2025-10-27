// =====================================================
// HOOK OPTIMIZADO PARA PROMOCIONES DE MEDIOS DE PAGO
// =====================================================
// Hook que usa las vistas optimizadas para evitar múltiples queries
// Autor: SABU Team
// Fecha: 2025

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// =====================================================
// HOOK: MEDIOS DE PAGO DEL USUARIO CON PROMOCIONES
// =====================================================
// Hook optimizado que obtiene medios de pago del usuario
// con todas sus promociones activas en una sola query

export const useMediosPagoConPromociones = (usuarioId) => {
  const [mediosPago, setMediosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usuarioId) {
      fetchMediosPago();
    }
  }, [usuarioId]);

  const fetchMediosPago = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vista_medios_pago_usuario_con_promociones')
        .select('*')
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      setMediosPago(data || []);
    } catch (err) {
      console.error('Error fetching medios pago con promociones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshMediosPago = () => {
    fetchMediosPago();
  };

  return { 
    mediosPago, 
    loading, 
    error, 
    refreshMediosPago 
  };
};

// =====================================================
// HOOK: CALCULAR MEJOR PRECIO CON PROMOCIONES
// =====================================================
// Hook que usa la función de PostgreSQL para calcular
// el mejor precio considerando promociones

export const useCalcularMejorPrecio = () => {
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState(null);

  const calcularMejorPrecio = async (usuarioId, supermercadoId, diasSeleccionados, precioBase) => {
    try {
      setCalculando(true);
      setError(null);

      const { data, error } = await supabase.rpc('calcular_mejor_precio_con_promociones', {
        p_usuario_id: usuarioId,
        p_supermercado_id: supermercadoId,
        p_dias_seleccionados: diasSeleccionados,
        p_precio_base: precioBase
      });

      if (error) throw error;

      return data?.[0] || null;
    } catch (err) {
      console.error('Error calculando mejor precio:', err);
      setError(err.message);
      return null;
    } finally {
      setCalculando(false);
    }
  };

  return { 
    calcularMejorPrecio, 
    calculando, 
    error 
  };
};

// =====================================================
// FUNCIÓN: CALCULAR PROMOCIONES EN MEMORIA
// =====================================================
// Función alternativa que calcula promociones en el frontend
// usando la vista optimizada (fallback si la función PostgreSQL no funciona)

export const calcularPromocionesEnMemoria = async (usuarioId, supermercadoId, diasSeleccionados, precioBase) => {
  try {
    // UNA SOLA QUERY para obtener todas las promociones activas
    const { data: promocionesActivas, error: promocionesError } = await supabase
      .from('vista_promociones_medios_pago_activas')
      .select('*')
      .eq('supermercado_id', supermercadoId);

    if (promocionesError) throw promocionesError;

    // UNA SOLA QUERY para obtener medios de pago del usuario
    const { data: mediosPagoUsuario, error: mediosError } = await supabase
      .from('medios_de_pago_x_usuario')
      .select(`
        medio_de_pago_id,
        medios_de_pago (
          id,
          nombre,
          tipo,
          banco
        )
      `)
      .eq('usuario_id', usuarioId)
      .eq('activo', true);

    if (mediosError) throw mediosError;

    // Calcular mejor opción en memoria
    let mejorPrecio = precioBase;
    let mejorMedioPago = null;
    let mejorPromocion = null;
    let mejorDescuento = 0;
    let mejoresDias = [];

    // Para cada medio de pago del usuario
    for (const medioPagoUser of mediosPagoUsuario) {
      const medioPago = medioPagoUser.medios_de_pago;
      
      // Buscar promociones para este medio de pago
      const promocionesValidas = promocionesActivas?.filter(promocion => 
        promocion.medio_de_pago_id === medioPago.id &&
        promocion.dias_semana.some(dia => diasSeleccionados.includes(dia))
      ) || [];

      // Si hay promociones válidas, calcular descuento
      if (promocionesValidas.length > 0) {
        const promocion = promocionesValidas[0]; // Tomar la primera
        
        // Calcular descuento
        const descuentoMaximo = precioBase * (promocion.descuento_porcentaje / 100);
        const descuentoAplicado = promocion.tope_descuento 
          ? Math.min(descuentoMaximo, promocion.tope_descuento)
          : descuentoMaximo;
        
        const precioFinal = precioBase - descuentoAplicado;
        
        // Si es mejor precio, actualizar
        if (precioFinal < mejorPrecio) {
          mejorPrecio = precioFinal;
          mejorMedioPago = medioPago;
          mejorPromocion = promocion;
          mejorDescuento = descuentoAplicado;
          mejoresDias = promocion.dias_semana.filter(dia => diasSeleccionados.includes(dia));
        }
      }
    }

    return {
      mejor_precio: mejorPrecio,
      mejor_medio_pago_id: mejorMedioPago?.id || null,
      mejor_medio_pago_nombre: mejorMedioPago?.nombre || null,
      mejor_promocion_id: mejorPromocion?.promocion_id || null,
      mejor_descuento_aplicado: mejorDescuento,
      dias_mejores: mejoresDias
    };

  } catch (err) {
    console.error('Error calculando promociones en memoria:', err);
    throw err;
  }
};

// =====================================================
// UTILIDADES PARA FORMATEO
// =====================================================

export const formatearDescuento = (descuento) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(descuento);
};

export const formatearPorcentajeDescuento = (porcentaje) => {
  return `${porcentaje.toFixed(1)}%`;
};

export const getDiasSemanaTexto = (dias) => {
  const nombresDias = {
    1: 'Lunes',
    2: 'Martes', 
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
  };
  
  return dias.map(dia => nombresDias[dia] || `Día ${dia}`).join(', ');
};

export const getMedioPagoIcono = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case 'visa':
      return '💳';
    case 'mastercard':
      return '💳';
    case 'amex':
      return '💳';
    case 'qr':
      return '📱';
    default:
      return '💳';
  }
};

export const getBancoColor = (banco) => {
  switch (banco?.toLowerCase()) {
    case 'banco nación':
      return 'text-blue-600 bg-blue-100';
    case 'santander':
      return 'text-red-600 bg-red-100';
    case 'american express':
      return 'text-green-600 bg-green-100';
    case 'billetera virtual':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
