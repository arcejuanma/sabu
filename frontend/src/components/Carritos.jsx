import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../utils/formatters'

// Nombres de los días de la semana
const nombresDias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Carritos() {
  const { user } = useAuth()
  const [carritos, setCarritos] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCarrito, setEditingCarrito] = useState(null)
  const [editForm, setEditForm] = useState({ nombre: '' })
  const [showNewCarritoModal, setShowNewCarritoModal] = useState(false)
  const [newCarritoForm, setNewCarritoForm] = useState({ nombre: '' })
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedProductos, setSelectedProductos] = useState([])
  const [showPreciosModal, setShowPreciosModal] = useState(false)
  const [showDiaSeleccionModal, setShowDiaSeleccionModal] = useState(false)
  const [diasSeleccionados, setDiasSeleccionados] = useState([])
  const [preciosPorSupermercado, setPreciosPorSupermercado] = useState([])
  const [calculatingPrices, setCalculatingPrices] = useState(false)
  const [carritoSeleccionado, setCarritoSeleccionado] = useState(null)
  const [mejorDia, setMejorDia] = useState(false) // Indica si se usó el botón "Mejor Día"

  useEffect(() => {
    if (user) {
      fetchCarritos()
      fetchProductos()
      fetchCategorias()
    }
  }, [user])

  const fetchCategorias = async () => {
    try {
      console.log('🔍 Fetching categorias...')
      console.log('🔗 Supabase URL:', supabase.supabaseUrl)
      
      // Test 1: Consulta simple
      let { data, error } = await supabase
        .from('categorias_productos')
        .select('*')

      console.log('📊 Query 1 - SELECT *:', { data, error, count: data?.length })
      
      // Test 2: Si falla, verificar permisos
      if (error) {
        console.error('❌ Error en query:', error.message, error.code, error.details)
      }
      
      // Test 3: Intentar con count
      const { count, error: countError } = await supabase
        .from('categorias_productos')
        .select('*', { count: 'exact', head: true })
      
      console.log('📊 Count query:', { count, countError })
      
      if (data && data.length > 0) {
        console.log('✅ Categorias encontradas:', data.length)
        console.log('📋 Primeras categorías:', data.slice(0, 3))
        setCategorias(data)
      } else {
        console.warn('⚠️ No hay categorías. Verifica:')
        console.warn('   1. Que la tabla tenga datos')
        console.warn('   2. Que las políticas RLS permitan lectura')
        console.warn('   3. Que el rol anon tenga permisos')
      }
    } catch (error) {
      console.error('💥 Error:', error)
    }
  }

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre, categoria_id, categorias_productos(nombre)')
        .eq('activo', true)

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error fetching productos:', error)
    }
  }

  const fetchCarritos = async () => {
    try {
      const { data, error } = await supabase
        .from('carritos_x_usuario')
        .select(`
          *,
          productos_x_carrito (
            *,
            productos (
              id,
              nombre,
              categorias_productos (nombre)
            )
          )
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('🛒 Carritos fetched:', data)
      if (data && data.length > 0) {
        console.log('📦 First cart products:', data[0].productos_x_carrito)
      }
      
      setCarritos(data || [])
    } catch (error) {
      console.error('Error fetching carritos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProducto = (producto) => {
    setSelectedProductos(prev => {
      const exists = prev.find(p => p.id === producto.id)
      if (exists) {
        return prev.filter(p => p.id !== producto.id)
      } else {
        return [...prev, { ...producto, cantidad: 1 }]
      }
    })
  }

  const handleChangeCantidad = (productoId, cantidad) => {
    // Validar que la cantidad esté entre 0 y 99, y tenga máximo 1 decimal
    if (cantidad === '' || cantidad < 0) {
      cantidad = 0
    } else if (cantidad > 99) {
      cantidad = 99
    }
    
    // Validar formato: máximo 1 decimal
    const cantidadStr = cantidad.toString()
    const parts = cantidadStr.split('.')
    if (parts[1] && parts[1].length > 1) {
      cantidad = parseFloat(parts[0] + '.' + parts[1][0])
    }
    
    setSelectedProductos(prev =>
      prev.map(p =>
        p.id === productoId ? { ...p, cantidad } : p
      )
    )
  }

  const handleIncrementarCantidad = (productoId) => {
    const producto = selectedProductos.find(p => p.id === productoId)
    if (producto) {
      let newCantidad = (producto.cantidad || 1) + 1
      if (newCantidad > 99) newCantidad = 99
      handleChangeCantidad(productoId, newCantidad)
    }
  }

  const handleDecrementarCantidad = (productoId) => {
    const producto = selectedProductos.find(p => p.id === productoId)
    if (producto) {
      let newCantidad = (producto.cantidad || 1) - 1
      if (newCantidad < 0) newCantidad = 0
      handleChangeCantidad(productoId, newCantidad)
    }
  }

  const handleCreateCarrito = async (e) => {
    e.preventDefault()

    if (selectedProductos.length === 0) {
      alert('Debes seleccionar al menos un producto')
      return
    }

    try {
      const { data: carritoData, error: carritoError } = await supabase
        .from('carritos_x_usuario')
        .insert({
          usuario_id: user.id,
          nombre: newCarritoForm.nombre
        })
        .select()

      if (carritoError) throw carritoError

      const productosInsert = selectedProductos.map(producto => ({
        carrito_id: carritoData[0].id,
        producto_id: producto.id,
        cantidad: producto.cantidad || 1
      }))

      const { error: productosError } = await supabase
        .from('productos_x_carrito')
        .insert(productosInsert)

      if (productosError) throw productosError

      setShowNewCarritoModal(false)
      setNewCarritoForm({ nombre: '' })
      setSelectedCategoria(null)
      setSelectedProductos([])
      fetchCarritos()
    } catch (error) {
      console.error('Error creating carrito:', error)
      alert('Error al crear el carrito')
    }
  }

  const handleEditCarrito = (carrito) => {
    setEditingCarrito(carrito)
    setEditForm({ nombre: carrito.nombre })
    
    // Cargar los productos del carrito en selectedProductos
    const productosDelCarrito = carrito.productos_x_carrito?.map(pc => ({
      id: pc.productos.id,
      nombre: pc.productos.nombre,
      categoria_id: pc.productos.categoria_id,
      cantidad: pc.cantidad || 1
    })) || []
    
    setSelectedProductos(productosDelCarrito)
    setShowEditModal(true)
  }

  const handleUpdateCarrito = async () => {
    try {
      // Actualizar nombre del carrito
      const { error: carritoError } = await supabase
        .from('carritos_x_usuario')
        .update({
          nombre: editForm.nombre
        })
        .eq('id', editingCarrito.id)

      if (carritoError) throw carritoError

      // Eliminar todos los productos actuales del carrito
      await supabase
        .from('productos_x_carrito')
        .delete()
        .eq('carrito_id', editingCarrito.id)

      // Insertar los nuevos productos
      const productosInsert = selectedProductos.map(producto => ({
        carrito_id: editingCarrito.id,
        producto_id: producto.id,
        cantidad: producto.cantidad || 1
      }))

      const { error: productosError } = await supabase
        .from('productos_x_carrito')
        .insert(productosInsert)

      if (productosError) throw productosError

      setShowEditModal(false)
      setEditingCarrito(null)
      setSelectedCategoria(null)
      setSelectedProductos([])
      fetchCarritos()
    } catch (error) {
      console.error('Error updating carrito:', error)
      alert('Error al actualizar el carrito')
    }
  }

  const handleDeleteCarrito = async (carritoId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este carrito?')) return

    try {
      await supabase
        .from('productos_x_carrito')
        .delete()
        .eq('carrito_id', carritoId)

      const { error } = await supabase
        .from('carritos_x_usuario')
        .delete()
        .eq('id', carritoId)

      if (error) throw error
      fetchCarritos()
    } catch (error) {
      console.error('Error deleting carrito:', error)
      alert('Error al eliminar el carrito')
    }
  }

  const handleRealizarCompra = async (carrito) => {
    console.log('\n🚀 Iniciando cálculo de precios para carrito:', carrito.nombre)
    console.log('📋 Productos en el carrito:', carrito.productos_x_carrito)
    
    // Guardar carrito y mostrar modal de selección de días
    setCarritoSeleccionado(carrito)
    setMejorDia(false)
    setDiasSeleccionados([])
    setShowDiaSeleccionModal(true)
  }

  const handleConfirmarDias = async () => {
    if (diasSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un día')
      return
    }

    setShowDiaSeleccionModal(false)
    setCalculatingPrices(true)
    setShowPreciosModal(true)
    
    try {
      // Obtener los supermercados preferidos del usuario
      const { data: supermercadosPref, error: superError } = await supabase
        .from('supermercados_preferidos_usuario')
        .select(`
          supermercado_id,
          supermercados (
            id,
            nombre
          )
        `)
        .eq('usuario_id', user.id)
        .eq('activo', true)

      if (superError) throw superError

      if (!supermercadosPref || supermercadosPref.length === 0) {
        alert('No tienes supermercados preferidos configurados')
        setShowPreciosModal(false)
        return
      }

      console.log('🏪 Supermercados preferidos encontrados:', supermercadosPref)

      const carrito = carritoSeleccionado
      
      // Verificar si hay productos en el carrito
      if (!carrito.productos_x_carrito || carrito.productos_x_carrito.length === 0) {
        alert('El carrito no tiene productos')
        setShowPreciosModal(false)
        return
      }

      console.log('📦 Productos en el carrito:', carrito.productos_x_carrito.length)
      console.log('📅 Días seleccionados:', diasSeleccionados)

      // Obtener los medios de pago del usuario
      const { data: mediosPagoPref, error: mediosError } = await supabase
        .from('medios_de_pago_x_usuario')
        .select(`
          medio_de_pago_id,
          medios_de_pago (
            id,
            nombre,
            banco
          )
        `)
        .eq('usuario_id', user.id)
        .eq('activo', true)

      if (mediosError) throw mediosError

      console.log('💳 Medios de pago disponibles:', mediosPagoPref?.map(mp => mp.medios_de_pago.nombre))

      // Calcular el precio para cada supermercado usando la VISTA optimizada
      const preciosCalculados = []

      console.log(`📊 Obteniendo resumen del carrito desde la vista...`)
      
      // UNA SOLA QUERY para obtener todos los precios por supermercado
      const { data: resumenCarrito, error: resumenError } = await supabase
        .from('vista_resumen_carrito_supermercados')
        .select('*')
        .eq('carrito_id', carrito.id)

      if (resumenError) {
        console.error('❌ Error al obtener resumen:', resumenError)
        throw resumenError
      }

      console.log('✅ Resumen obtenido:', resumenCarrito)

      // Ahora obtener el detalle solo para los supermercados preferidos del usuario
      for (const pref of supermercadosPref) {
        const supermercado = pref.supermercados
        
        console.log(`\n🛒 Calculando precios para supermercado: ${supermercado.nombre}`)

        // Filtrar el resumen para este supermercado
        const resumenSuper = resumenCarrito?.find(r => r.supermercado_id === supermercado.id)
        
        if (!resumenSuper) {
          console.error(`❌ No se encontró resumen para ${supermercado.nombre}`)
          continue
        }

        const total = parseFloat(resumenSuper.precio_total) || 0
        console.log(`💰 Total ${supermercado.nombre}: $${total}`)

        // Obtener detalle solo si es necesario (bajo demanda)
        let productosPrecios = []
        
        // UNA SOLA QUERY para obtener el detalle del supermercado
        const { data: detalleData, error: detalleError } = await supabase
          .from('vista_detalle_carrito_supermercado')
          .select('*')
          .eq('carrito_id', carrito.id)
          .eq('supermercado_id', supermercado.id)

        if (!detalleError && detalleData) {
          productosPrecios = detalleData.map(producto => ({
            nombre: producto.producto_nombre,
            cantidad: producto.cantidad,
            precio: parseFloat(producto.precio) || 0,
            subtotal: parseFloat(producto.subtotal) || 0,
            descuentoAplicado: 0, // Por ahora sin descuentos en la vista
            promocionAplicada: null,
            estado: producto.estado_producto
          }))
        }
        
        console.log(`📦 Productos procesados: ${productosPrecios.length}`)
        
        console.log(`💰 Total base ${supermercado.nombre}: $${total}`)
        
        // Para cada día, calcular todas las opciones con medio de pago
        const opcionesPorDia = []
        
        for (const dia of diasSeleccionados) {
          let mejorPrecioDelDia = total
          let mejorMedioPagoDelDia = null
          let mejorPromocionDelDia = null
          
          // Evaluar cada medio de pago para este día
          for (const medioPagoUser of mediosPagoPref) {
            const medioPago = medioPagoUser.medios_de_pago
            
            // Buscar promociones para este medio de pago, supermercado y día
            const hoy = new Date().toISOString().split('T')[0]
            const { data: promociones, error: promocionesError } = await supabase
              .from('promociones_medios_pago')
              .select('*')
              .eq('medio_de_pago_id', medioPago.id)
              .eq('supermercado_id', supermercado.id)
              .eq('activo', true)
              .lte('fecha_inicio', hoy)
              .gte('fecha_fin', hoy)
            
            if (promocionesError) continue
            
            // Filtrar para el día específico
            const promocionesValidas = promociones?.filter(p => {
              if (!p.dias_semana || !Array.isArray(p.dias_semana)) return false
              return p.dias_semana.includes(dia)
            }) || []
            
            // Si hay promociones válidas, calcular descuento
            if (promocionesValidas.length > 0) {
              const promocion = promocionesValidas[0]
              
              // Calcular descuento
              const descuentoMaximo = total * (promocion.descuento_porcentaje / 100)
              const descuentoAplicado = promocion.tope_descuento 
                ? Math.min(descuentoMaximo, promocion.tope_descuento)
                : descuentoMaximo
              
              const totalConDescuento = total - descuentoAplicado
              
              if (totalConDescuento < mejorPrecioDelDia) {
                mejorPrecioDelDia = totalConDescuento
                mejorMedioPagoDelDia = medioPago
                mejorPromocionDelDia = promocion
              }
            }
          }
          
          opcionesPorDia.push({
            dia,
            precio: mejorPrecioDelDia,
            medioPago: mejorMedioPagoDelDia,
            promocion: mejorPromocionDelDia
          })
        }
        
        // Encontrar el mejor precio
        const mejorPrecio = Math.min(...opcionesPorDia.map(o => o.precio))
        
        // Agrupar días y medios de pago con el mejor precio
        const mejoresOpciones = opcionesPorDia.filter(o => o.precio === mejorPrecio)
        const mejoresDiasArray = [...new Set(mejoresOpciones.map(o => o.dia))]
        
        // Agrupar opciones por día con su medio de pago
        const opcionesPorDiaYMedio = {}
        mejoresOpciones.forEach(opcion => {
          if (!opcionesPorDiaYMedio[opcion.dia]) {
            opcionesPorDiaYMedio[opcion.dia] = {
              dia: opcion.dia,
              medioPago: opcion.medioPago,
              promocion: opcion.promocion
            }
          }
        })
        
        // Determinar cómo mostrar la información
        const mediosDePagoUnicos = new Set()
        mejoresOpciones.forEach(o => {
          if (o.medioPago) {
            mediosDePagoUnicos.add(o.medioPago.nombre)
          }
        })
        
        const tieneMultiplesMedios = mediosDePagoUnicos.size > 1
        const medioPagoTexto = tieneMultiplesMedios 
          ? 'Abonando con cualquier medio de pago' 
          : mejoresOpciones[0]?.medioPago?.nombre || 'Abonando con cualquier medio de pago'
        
        // Seleccionar la primera promoción (si existe)
        const mejorPromocion = mejoresOpciones.find(o => o.promocion)?.promocion || null
        
        // Guardar información detallada para cada día
        const infoPorDia = Object.values(opcionesPorDiaYMedio)
        
        console.log(`📊 Mejor opción para ${supermercado.nombre}: $${mejorPrecio}`)
        
        // Guardar resultado para este supermercado
        preciosCalculados.push({
          supermercado: supermercado.nombre,
          supermercadoId: supermercado.id,
          total: mejorPrecio,
          productos: productosPrecios,
          diasRecomendados: mejoresDiasArray,
          usarMejorDia: mejorDia,
          diasSeleccionadosUsuario: diasSeleccionados.length,
          medioPago: tieneMultiplesMedios ? null : mejoresOpciones[0]?.medioPago || null,
          medioPagoTexto,
          promocion: mejorPromocion,
          infoPorDia: tieneMultiplesMedios ? infoPorDia : null
        })
      }

      // Ordenar por precio total (menor a mayor)
      preciosCalculados.sort((a, b) => a.total - b.total)

      setPreciosPorSupermercado(preciosCalculados)
    } catch (error) {
      console.error('❌ Error calculating prices:', error)
      alert(`Error al calcular los precios: ${error.message || 'Error desconocido'}`)
      setShowPreciosModal(false)
    } finally {
      setCalculatingPrices(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sabu-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Carritos de Compra</h2>
        <button 
          onClick={() => setShowNewCarritoModal(true)}
          className="bg-sabu-primary text-white px-4 py-2 rounded-md hover:bg-sabu-primary-dark"
        >
          ➕ Nuevo Carrito
        </button>
      </div>

      {carritos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes carritos aún</p>
          <p className="text-sm text-gray-400">Crea tu primer carrito para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {carritos.map((carrito) => (
            <div key={carrito.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{carrito.nombre}</h3>
                  <p className="text-sm text-gray-700">
                    {carrito.productos_x_carrito?.length || 0} productos
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <button
                    onClick={() => handleRealizarCompra(carrito)}
                    className="bg-sabu-primary text-white px-4 py-2 rounded-md hover:bg-sabu-primary-dark text-sm font-medium"
                  >
                    Calcular Compra Óptima
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCarrito(carrito)}
                      className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50"
                      title="Editar carrito"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCarrito(carrito.id)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50"
                      title="Eliminar carrito"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para editar carrito */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold mb-4">Editar Carrito</h3>
            
            {/* Formulario básico */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Carrito
              </label>
              <input
                type="text"
                required
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sabu-primary"
                placeholder="Ej: Compra Semanal"
              />
            </div>

            {/* Selección de productos */}
            <div className="flex-1 overflow-hidden flex gap-4">
              {/* Panel de Categorías */}
              <div className="w-1/5 border-r pr-4 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-3">Categorías</h4>
                <div className="space-y-2">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.id}
                      onClick={() => setSelectedCategoria(categoria.id)}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        selectedCategoria === categoria.id
                          ? 'bg-sabu-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium">{categoria.nombre}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel de Productos */}
              <div className="flex-1 overflow-y-auto">
                {selectedCategoria ? (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {categorias.find(c => c.id === selectedCategoria)?.nombre}
                    </h4>
                    <div className="space-y-2">
                      {productos
                        .filter(p => p.categoria_id === selectedCategoria)
                        .map((producto) => {
                          const isSelected = selectedProductos.find(p => p.id === producto.id)
                          return (
                            <button
                              key={producto.id}
                              onClick={() => handleToggleProducto(producto)}
                              className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                                isSelected
                                  ? 'border-sabu-primary bg-green-50'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {producto.nombre}
                            </button>
                          )
                        })}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Selecciona una categoría para ver los productos</p>
                  </div>
                )}
              </div>

              {/* Panel de Productos Seleccionados */}
              <div className="w-1/4 border-l pl-4 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Seleccionados ({selectedProductos.length})
                </h4>
                {selectedProductos.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No hay productos seleccionados</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProductos.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-md bg-green-50 border-2 border-green-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{p.nombre}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className="flex items-center gap-1 bg-white rounded-md border border-gray-300">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementarCantidad(p.id)}
                                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 text-sm font-semibold"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  step="1"
                                  value={p.cantidad || 1}
                                  onChange={(e) => handleChangeCantidad(p.id, parseFloat(e.target.value) || 0)}
                                  className="w-14 px-2 py-1 text-center text-xs border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-sabu-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleIncrementarCantidad(p.id)}
                                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 text-sm font-semibold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleProducto(p)}
                            className="text-red-600 hover:text-red-700 text-lg leading-none"
                            title="Eliminar"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateCarrito}
                  disabled={selectedProductos.length === 0}
                  className="flex-1 bg-sabu-primary text-white px-4 py-2 rounded-md hover:bg-sabu-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCarrito(null)
                    setSelectedCategoria(null)
                    setSelectedProductos([])
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo carrito */}
      {showNewCarritoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold mb-4">Nuevo Carrito de Compra</h3>
            
            {/* Formulario básico */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Carrito
              </label>
              <input
                type="text"
                required
                value={newCarritoForm.nombre}
                onChange={(e) => setNewCarritoForm({ ...newCarritoForm, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sabu-primary"
                placeholder="Ej: Compra Semanal"
              />
            </div>

            {/* Selección de productos */}
            <div className="flex-1 overflow-hidden flex gap-4">
              {/* Panel de Categorías */}
              <div className="w-1/5 border-r pr-4 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Categorías
                </h4>
                <div className="space-y-2">
                  {categorias.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No hay categorías disponibles</p>
                  ) : (
                    categorias.map((categoria) => (
                      <button
                        key={categoria.id}
                        onClick={() => setSelectedCategoria(categoria.id)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedCategoria === categoria.id
                            ? 'bg-sabu-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-medium">{categoria.nombre}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Panel de Productos */}
              <div className="flex-1 overflow-y-auto">
                {selectedCategoria ? (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {categorias.find(c => c.id === selectedCategoria)?.nombre}
                    </h4>
                                        <div className="space-y-2">
                      {productos
                        .filter(p => p.categoria_id === selectedCategoria)
                        .map((producto) => {
                          const isSelected = selectedProductos.find(p => p.id === producto.id)
                          
                          return (
                            <button
                              key={producto.id}
                              onClick={() => handleToggleProducto(producto)}
                              className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                                isSelected
                                  ? 'border-sabu-primary bg-green-50'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {producto.nombre}
                            </button>
                          )
                        })}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Selecciona una categoría para ver los productos</p>
                  </div>
                )}
              </div>

              {/* Panel de Productos Seleccionados */}
              <div className="w-1/4 border-l pl-4 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Seleccionados ({selectedProductos.length})
                </h4>
                {selectedProductos.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No hay productos seleccionados</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProductos.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-md bg-green-50 border-2 border-green-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{p.nombre}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className="flex items-center gap-1 bg-white rounded-md border border-gray-300">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementarCantidad(p.id)}
                                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 text-sm font-semibold"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  step="1"
                                  value={p.cantidad || 1}
                                  onChange={(e) => handleChangeCantidad(p.id, parseFloat(e.target.value) || 0)}
                                  className="w-14 px-2 py-1 text-center text-xs border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-sabu-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleIncrementarCantidad(p.id)}
                                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 text-sm font-semibold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleProducto(p)}
                            className="text-red-600 hover:text-red-700 text-lg leading-none"
                            title="Eliminar"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCarrito}
                  disabled={selectedProductos.length === 0}
                  className="flex-1 bg-sabu-primary text-white px-4 py-2 rounded-md hover:bg-sabu-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Crear Carrito
                </button>
                <button
                  onClick={() => {
                    setShowNewCarritoModal(false)
                    setNewCarritoForm({ nombre: '' })
                    setSelectedCategoria(null)
                    setSelectedProductos([])
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Días */}
      {showDiaSeleccionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">¿Cuándo vas a realizar la compra?</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Seleccioná uno o varios días de la semana para calcular los mejores precios
              </p>
              
              {/* Días de la semana */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { num: 1, nombre: 'Lunes' },
                  { num: 2, nombre: 'Martes' },
                  { num: 3, nombre: 'Miércoles' },
                  { num: 4, nombre: 'Jueves' },
                  { num: 5, nombre: 'Viernes' },
                  { num: 6, nombre: 'Sábado' },
                  { num: 7, nombre: 'Domingo' }
                ].map((dia) => {
                  const isSelected = diasSeleccionados.includes(dia.num)
                  return (
                    <button
                      key={dia.num}
                      onClick={() => {
                        if (isSelected) {
                          setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia.num))
                        } else {
                          setDiasSeleccionados([...diasSeleccionados, dia.num])
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? 'border-sabu-primary bg-green-50 text-sabu-primary font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {dia.nombre}
                    </button>
                  )
                })}
              </div>

              {/* Botón "Mejor Día" */}
              <button
                onClick={() => {
                  // Seleccionar todos los días para que la app calcule cuál es el mejor
                  setDiasSeleccionados([1, 2, 3, 4, 5, 6, 7])
                  setMejorDia(true)
                }}
                className="w-full py-3 rounded-lg border-2 border-dashed border-sabu-primary bg-green-50 text-sabu-primary hover:bg-green-100 transition-colors font-semibold"
              >
                📅 Mejor Día
              </button>
            </div>

            <div className="mt-6 pt-4 border-t flex gap-2">
              <button
                onClick={() => {
                  setShowDiaSeleccionModal(false)
                  setDiasSeleccionados([])
                  setCarritoSeleccionado(null)
                  setMejorDia(false)
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDias}
                disabled={diasSeleccionados.length === 0}
                className="flex-1 bg-sabu-primary text-white px-4 py-2 rounded-md hover:bg-sabu-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Precios por Supermercado */}
      {showPreciosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold mb-4">Precios por Supermercado</h3>
            
            {calculatingPrices ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabu-primary"></div>
              </div>
            ) : preciosPorSupermercado.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No se pudieron calcular los precios</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <div className="space-y-4">
                  {preciosPorSupermercado.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg ${
                        index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="text-lg font-semibold">{item.supermercado}</h4>
                          {item.infoPorDia && item.infoPorDia.length > 0 ? (
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                              {item.infoPorDia.map((info, idx) => (
                                <div key={idx}>
                                  💳 {nombresDias[info.dia]} con {info.medioPago?.nombre || 'cualquier medio de pago'}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 mt-1">
                              💳 {item.medioPagoTexto}
                            </div>
                          )}
                          {item.promocion && (
                            <div className="text-xs text-green-700 mt-1">
                              🎉 {item.promocion.descripcion || 'Promoción aplicada'}
                            </div>
                          )}
                          {item.diasRecomendados && item.diasRecomendados.length > 0 && (
                            <div className="text-sm text-gray-600">
                              📅 {item.usarMejorDia 
                                ? (item.diasRecomendados.length === 7
                                  ? 'Cualquier día de la semana'
                                  : item.diasRecomendados.length > 1 
                                    ? `Mejor comprando: ${item.diasRecomendados.map(d => nombresDias[d]).join(' o ')}`
                                    : `Mejor comprando: ${nombresDias[item.diasRecomendados[0]]}`)
                                : (item.diasRecomendados.length === item.diasSeleccionadosUsuario
                                  ? `Mejor comprando: ${item.diasRecomendados.map(d => nombresDias[d]).join(' o ')}`
                                  : item.diasRecomendados.length > 1
                                    ? `Mejor comprando: ${item.diasRecomendados.map(d => nombresDias[d]).join(' o ')}`
                                    : `Mejor comprando: ${nombresDias[item.diasRecomendados[0]]}`)
                              }
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-sabu-primary">
                            ${formatPrice(item.total)}
                          </span>
                          {index === 0 && (
                            <div className="text-xs text-sabu-primary font-semibold mt-1">⭐ MEJOR PRECIO</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {item.productos.map((prod, prodIndex) => (
                          <div key={prodIndex} className="bg-white p-2 rounded">
                            <div className="flex justify-between text-sm">
                              <span>
                                {prod.nombre} x{prod.cantidad}
                              </span>
                              <span className="font-medium">
                                ${formatPrice(prod.subtotal)}
                              </span>
                            </div>
                            {prod.descuentoAplicado > 0 && prod.promocionAplicada && (
                              <div className="text-xs text-green-600 mt-1">
                                🎉 {prod.promocionAplicada.descripcion || 'Descuento aplicado'}: ${formatPrice(prod.descuentoAplicado)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowPreciosModal(false)
                  setPreciosPorSupermercado([])
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
