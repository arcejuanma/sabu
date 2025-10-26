import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

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
  const [preciosPorSupermercado, setPreciosPorSupermercado] = useState([])
  const [calculatingPrices, setCalculatingPrices] = useState(false)

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

      // Verificar si hay productos en el carrito
      if (!carrito.productos_x_carrito || carrito.productos_x_carrito.length === 0) {
        alert('El carrito no tiene productos')
        setShowPreciosModal(false)
        return
      }

      console.log('📦 Productos en el carrito:', carrito.productos_x_carrito.length)

      // Calcular el precio para cada supermercado
      const preciosCalculados = []

      for (const pref of supermercadosPref) {
        const supermercado = pref.supermercados
        let totalPrecio = 0
        const productosPrecios = []

        console.log(`\n🛒 Calculando precios para supermercado: ${supermercado.nombre} (ID: ${supermercado.id})`)

        // Obtener los productos del carrito con sus precios en este supermercado
        for (const productoCarrito of carrito.productos_x_carrito) {
          console.log(`\n📦 Producto del carrito:`)
          console.log(`  - ID: ${productoCarrito.producto_id}`)
          console.log(`  - Nombre: ${productoCarrito.productos?.nombre}`)
          console.log(`  - Cantidad: ${productoCarrito.cantidad || 1}`)

          const { data: precioData, error: precioError } = await supabase
            .from('productos_x_supermercado')
            .select('precio')
            .eq('producto_id', productoCarrito.producto_id)
            .eq('supermercado_id', supermercado.id)
            .eq('activo', true)

          console.log(`  - Precio encontrado:`, precioData)
          console.log(`  - Error:`, precioError)

          if (precioError || !precioData || precioData.length === 0) {
            console.error(`❌ No se encontró precio para el producto ${productoCarrito.producto_id} en ${supermercado.nombre}`)
            console.error(`   Producto ID: ${productoCarrito.producto_id}`)
            console.error(`   Supermercado ID: ${supermercado.id}`)
            console.error(`   Supermercado Nombre: ${supermercado.nombre}`)
            console.error(`   Error:`, precioError)
            continue
          }

          const precio = parseFloat(precioData[0].precio) || 0
          const subtotal = precio * (productoCarrito.cantidad || 1)
          totalPrecio += subtotal

          console.log(`  - Precio: $${precio}`)
          console.log(`  - Subtotal: $${subtotal}`)

          productosPrecios.push({
            nombre: productoCarrito.productos.nombre,
            cantidad: productoCarrito.cantidad || 1,
            precio,
            subtotal
          })
        }

        console.log(`\n💰 Total para ${supermercado.nombre}: $${totalPrecio}`)

        preciosCalculados.push({
          supermercado: supermercado.nombre,
          supermercadoId: supermercado.id,
          total: totalPrecio,
          productos: productosPrecios
        })
      }

      // Ordenar por precio total (menor a mayor)
      preciosCalculados.sort((a, b) => a.total - b.total)

      setPreciosPorSupermercado(preciosCalculados)
    } catch (error) {
      console.error('❌ Error calculating prices:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert(`Error al calcular los precios: ${error.message || 'Error desconocido'}`)
      setShowPreciosModal(false)
    } finally {
      setCalculatingPrices(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Carritos de Compra</h2>
        <button 
          onClick={() => setShowNewCarritoModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
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
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                          ? 'bg-green-600 text-white'
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
                                  ? 'border-green-600 bg-green-50'
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
                                  className="w-14 px-2 py-1 text-center text-xs border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            ? 'bg-green-600 text-white'
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
                                  ? 'border-green-600 bg-green-50'
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
                                  className="w-14 px-2 py-1 text-center text-xs border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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

      {/* Modal de Precios por Supermercado */}
      {showPreciosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold mb-4">Precios por Supermercado</h3>
            
            {calculatingPrices ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                        <h4 className="text-lg font-semibold">{item.supermercado}</h4>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">
                            ${item.total.toFixed(2)}
                          </span>
                          {index === 0 && (
                            <div className="text-xs text-green-600 font-semibold mt-1">⭐ MEJOR PRECIO</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {item.productos.map((prod, prodIndex) => (
                          <div key={prodIndex} className="flex justify-between text-sm bg-white p-2 rounded">
                            <span>
                              {prod.nombre} x{prod.cantidad}
                            </span>
                            <span className="font-medium">
                              ${prod.subtotal.toFixed(2)}
                            </span>
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
