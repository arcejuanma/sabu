import React, { useState } from 'react';
import { 
  useResumenCarrito, 
  useDetalleCarrito, 
  formatearPrecio, 
  formatearPorcentaje,
  getEstadoColor,
  getEstadoIcono,
  getProductoEstadoColor,
  getProductoEstadoIcono
} from '../hooks/useCarritoComparacion';

// =====================================================
// COMPONENTE: COMPARACIÓN DE SUPERMERCADOS
// =====================================================
// Componente principal para comparar carrito entre supermercados
// Optimizado para mobile-first con paleta SABU

const ComparacionSupermercados = ({ carritoId }) => {
  const [supermercadoSeleccionado, setSupermercadoSeleccionado] = useState(null);
  const { resumen, loading, error } = useResumenCarrito(carritoId);
  const { detalle, loading: loadingDetalle, fetchDetalle, clearDetalle } = useDetalleCarrito(
    carritoId, 
    supermercadoSeleccionado
  );

  const handleSupermercadoClick = async (supermercadoId) => {
    if (supermercadoSeleccionado === supermercadoId) {
      // Si ya está seleccionado, deseleccionar
      setSupermercadoSeleccionado(null);
      clearDetalle();
    } else {
      // Seleccionar nuevo supermercado
      setSupermercadoSeleccionado(supermercadoId);
      await fetchDetalle();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BF63]"></div>
        <span className="ml-3 text-gray-600">Cargando comparación...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <span className="text-red-500 text-xl mr-2">❌</span>
          <div>
            <h3 className="text-red-800 font-semibold">Error al cargar comparación</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resumen || resumen.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 m-4 text-center">
        <span className="text-gray-500 text-4xl mb-2 block">🛒</span>
        <h3 className="text-gray-700 font-semibold mb-2">No hay productos en el carrito</h3>
        <p className="text-gray-500 text-sm">Agrega productos para comparar precios</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#0D146B] mb-2">
          Comparar Precios
        </h2>
        <p className="text-gray-600 text-sm">
          Selecciona un supermercado para ver el detalle
        </p>
      </div>

      {/* Resumen de Supermercados */}
      <div className="space-y-3">
        {resumen.map((supermercado) => (
          <SupermercadoCard
            key={supermercado.supermercado_id}
            supermercado={supermercado}
            isSelected={supermercadoSeleccionado === supermercado.supermercado_id}
            onClick={() => handleSupermercadoClick(supermercado.supermercado_id)}
          />
        ))}
      </div>

      {/* Detalle del Supermercado Seleccionado */}
      {supermercadoSeleccionado && (
        <DetalleSupermercado
          detalle={detalle}
          loading={loadingDetalle}
          supermercado={resumen.find(s => s.supermercado_id === supermercadoSeleccionado)}
        />
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE: TARJETA DE SUPERMERCADO
// =====================================================
// Tarjeta individual para cada supermercado en el resumen

const SupermercadoCard = ({ supermercado, isSelected, onClick }) => {
  const estadoColor = getEstadoColor(supermercado.estado_disponibilidad);
  const estadoIcono = getEstadoIcono(supermercado.estado_disponibilidad);

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-[#00BF63] bg-green-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-[#00BF63] hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {supermercado.supermercado_logo ? (
            <img 
              src={supermercado.supermercado_logo} 
              alt={supermercado.supermercado_nombre}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <span className="text-[#0D146B] font-bold text-sm">
                {supermercado.supermercado_nombre.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[#0D146B]">
              {supermercado.supermercado_nombre}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor}`}>
                {estadoIcono} {supermercado.estado_disponibilidad}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-[#00BF63]">
            {formatearPrecio(supermercado.precio_total)}
          </div>
          <div className="text-sm text-gray-500">
            {supermercado.productos_disponibles}/{supermercado.total_productos} productos
          </div>
        </div>
      </div>

      {/* Barra de disponibilidad */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Disponibilidad</span>
          <span>{formatearPorcentaje(supermercado.porcentaje_disponibilidad)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              supermercado.porcentaje_disponibilidad >= 90 ? 'bg-green-500' :
              supermercado.porcentaje_disponibilidad >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${supermercado.porcentaje_disponibilidad}%` }}
          ></div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {supermercado.productos_faltantes > 0 && (
            <span className="text-orange-600">
              ⚠️ {supermercado.productos_faltantes} faltantes
            </span>
          )}
        </span>
        {supermercado.ahorro_estimado > 0 && (
          <span className="text-green-600 font-medium">
            💰 Ahorro: {formatearPrecio(supermercado.ahorro_estimado)}
          </span>
        )}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: DETALLE DEL SUPERMERCADO
// =====================================================
// Detalle producto por producto del supermercado seleccionado

const DetalleSupermercado = ({ detalle, loading, supermercado }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00BF63]"></div>
          <span className="ml-2 text-gray-600">Cargando detalle...</span>
        </div>
      </div>
    );
  }

  if (!detalle || detalle.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-500 text-center">No hay detalles disponibles</p>
      </div>
    );
  }

  // Agrupar productos por categoría
  const productosPorCategoria = detalle.reduce((acc, producto) => {
    const categoria = producto.producto_categoria || 'Sin categoría';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {});

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#0D146B]">
          Detalle - {supermercado.supermercado_nombre}
        </h3>
        <div className="text-right">
          <div className="text-xl font-bold text-[#00BF63]">
            {formatearPrecio(supermercado.precio_total)}
          </div>
          <div className="text-sm text-gray-500">
            Total del carrito
          </div>
        </div>
      </div>

      {/* Productos por categoría */}
      <div className="space-y-4">
        {Object.entries(productosPorCategoria).map(([categoria, productos]) => (
          <div key={categoria}>
            <h4 className="font-medium text-[#0D146B] mb-2 border-b border-gray-200 pb-1">
              {categoria}
            </h4>
            <div className="space-y-2">
              {productos.map((producto) => (
                <ProductoDetalle key={producto.producto_id} producto={producto} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: DETALLE DE PRODUCTO
// =====================================================
// Detalle individual de cada producto

const ProductoDetalle = ({ producto }) => {
  const estadoColor = getProductoEstadoColor(producto.estado_producto);
  const estadoIcono = getProductoEstadoIcono(producto.estado_producto);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 flex-1">
        {producto.producto_imagen ? (
          <img 
            src={producto.producto_imagen} 
            alt={producto.producto_nombre}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
            <span className="text-[#0D146B] font-bold text-xs">
              {producto.producto_nombre.charAt(0)}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <h5 className="font-medium text-gray-800 text-sm">
            {producto.producto_nombre}
          </h5>
          {producto.producto_marca && (
            <p className="text-xs text-gray-500">{producto.producto_marca}</p>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor}`}>
              {estadoIcono} {producto.estado_producto.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500">
              Cantidad: {producto.cantidad}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-semibold text-[#0D146B]">
          {formatearPrecio(producto.subtotal)}
        </div>
        {producto.precio && (
          <div className="text-xs text-gray-500">
            {formatearPrecio(producto.precio)} c/u
          </div>
        )}
        {producto.ahorro_producto > 0 && (
          <div className="text-xs text-green-600 font-medium">
            💰 {formatearPrecio(producto.ahorro_producto)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparacionSupermercados;
