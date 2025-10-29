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
  const [categoriasLoading, setCategoriasLoading] = useState(false)
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
  const [productosExpandidos, setProductosExpandidos] = useState(new Set()) // Índices de items expandidos
  const [showSeleccionadosDrawer, setShowSeleccionadosDrawer] = useState(false) // Para mostrar drawer de productos seleccionados en móvil
  const [productosTemporales, setProductosTemporales] = useState(null) // Para calcular compra óptima desde productos seleccionados

  useEffect(() => {
    if (user) {
      fetchCarritos()
      fetchProductos()
      fetchCategorias()
    }
  }, [user])

  const fetchCategorias = async () => {
    if (categoriasLoading) return // Evitar llamadas duplicadas
    
    try {
      setCategoriasLoading(true)
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
    } finally {
      setCategoriasLoading(false)
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

  const handleAddProducto = (producto) => {
    setSelectedProductos(prev => {
      const exists = prev.find(p => p.id === producto.id)
      if (exists) {
        // Si ya existe, incrementar cantidad
        return prev.map(p => 
          p.id === producto.id 
            ? { ...p, cantidad: Math.min((p.cantidad || 1) + 1, 99) }
            : p
        )
      } else {
        // Si no existe, agregarlo
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
      setShowSeleccionadosDrawer(false)
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
    // Agrupar productos duplicados y sumar cantidades
    const productosMap = new Map()
    
    carrito.productos_x_carrito?.forEach(pc => {
      const productoId = pc.productos.id
      if (productosMap.has(productoId)) {
        // Si ya existe, sumar la cantidad
        const existente = productosMap.get(productoId)
        existente.cantidad += pc.cantidad || 1
        productosMap.set(productoId, existente)
      } else {
        // Si no existe, agregarlo
        productosMap.set(productoId, {
          id: pc.productos.id,
          nombre: pc.productos.nombre,
          categoria_id: pc.productos.categoria_id,
          cantidad: pc.cantidad || 1
        })
      }
    })
    
    const productosDelCarrito = Array.from(productosMap.values())
    console.log('📦 Productos del carrito (agrupados):', productosDelCarrito)
    
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
      setShowSeleccionadosDrawer(false)
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
    setProductosTemporales(null) // Limpiar productos temporales
    setMejorDia(false)
    setDiasSeleccionados([])
    setShowDiaSeleccionModal(true)
  }

  const handleCalcularCompraDesdeSeleccionados = () => {
    if (selectedProductos.length === 0) {
      alert('Debes seleccionar al menos un producto')
      return
    }
    
    console.log('\n🚀 Iniciando cálculo de precios desde productos seleccionados')
    console.log('📋 Productos seleccionados:', selectedProductos)
    
    // Guardar productos temporales y mostrar modal de selección de días
    setProductosTemporales(selectedProductos)
    setCarritoSeleccionado(null) // Limpiar carrito seleccionado
    setMejorDia(false)
    setDiasSeleccionados([])
    setShowSeleccionadosDrawer(false) // Cerrar drawer
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
    
    let carritoTemporalId = null // Variable para rastrear carrito temporal
    
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

      // Verificar si estamos usando productos temporales o un carrito guardado
      let carrito = carritoSeleccionado
      
      if (productosTemporales && productosTemporales.length > 0) {
        // Crear carrito temporal para el cálculo
        console.log('📦 Creando carrito temporal con productos seleccionados:', productosTemporales)
        
        try {
          // Crear carrito temporal
          const { data: carritoData, error: carritoError } = await supabase
            .from('carritos_x_usuario')
            .insert({
              usuario_id: user.id,
              nombre: 'Carrito Temporal - ' + Date.now() // Nombre único
            })
            .select()
            .single()
          
          if (carritoError) throw carritoError
          
          carritoTemporalId = carritoData.id
          
          // Insertar productos
          const productosInsert = productosTemporales.map(producto => ({
            carrito_id: carritoTemporalId,
            producto_id: producto.id,
            cantidad: producto.cantidad || 1
          }))
          
          const { error: productosError } = await supabase
            .from('productos_x_carrito')
            .insert(productosInsert)
          
          if (productosError) throw productosError
          
          // Crear objeto carrito con estructura similar
          carrito = {
            id: carritoTemporalId,
            productos_x_carrito: productosTemporales.map(p => ({
              productos: { id: p.id, nombre: p.nombre },
              cantidad: p.cantidad || 1
            }))
          }
          
          console.log('✅ Carrito temporal creado:', carritoTemporalId)
        } catch (error) {
          console.error('❌ Error creando carrito temporal:', error)
          alert('Error al calcular: no se pudo crear carrito temporal')
          setShowPreciosModal(false)
          setCalculatingPrices(false)
          return
        }
      } else {
        // Verificar si hay productos en el carrito guardado
        if (!carrito || !carrito.productos_x_carrito || carrito.productos_x_carrito.length === 0) {
          alert('El carrito no tiene productos')
          setShowPreciosModal(false)
          setCalculatingPrices(false)
          return
        }
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

        // OPTIMIZACIÓN: Calcular TODOS los descuentos unitarios de una vez
        let productosPrecios = []
        let totalConDescuentosUnitarios = 0
        
        console.log(`🔍 Obteniendo TODOS los productos del carrito para ${supermercado.nombre}...`)
        
        // USAR SIEMPRE la vista detalle que muestra TODOS los productos
        const { data: detalleData, error: detalleError } = await supabase
          .from('vista_detalle_carrito_supermercado')
          .select('*')
          .eq('carrito_id', carrito.id)
          .eq('supermercado_id', supermercado.id)

        if (!detalleError && detalleData) {
          console.log(`✅ Productos encontrados: ${detalleData.length}`)
          
          // Obtener descuentos unitarios por separado
          const { data: descuentosData, error: descuentosError } = await supabase.rpc('calcular_descuentos_unitarios_carrito', {
            p_carrito_id: carrito.id,
            p_supermercado_id: supermercado.id
          });

          console.log(`\n🔍 === RESULTADOS DEL RPC PARA ${supermercado.nombre} ===`)
          console.log(`📋 Total de descuentos retornados:`, descuentosData?.length || 0)
          console.log(`📋 Datos completos del RPC:`, JSON.stringify(descuentosData, null, 2))
          if (descuentosError) {
            console.error(`❌ Error en RPC de descuentos:`, descuentosError)
          }

          // Crear mapa de descuentos por producto desde RPC
          // Si hay duplicados, usar el que tenga el mayor descuento y precio más alto
          const descuentosMap = {}
          if (!descuentosError && descuentosData) {
            descuentosData.forEach(descuento => {
              const esLeche = descuento.producto_nombre?.toLowerCase().includes('leche')
              const esCarrefour = supermercado.nombre.toLowerCase().includes('carrefour')
              
              console.log(`📊 Descuento para "${descuento.producto_nombre}":`)
              console.log(`   - Producto ID: ${descuento.producto_id}`)
              console.log(`   - Cantidad: ${descuento.cantidad}`)
              console.log(`   - Precio base: $${descuento.precio_base}`)
              console.log(`   - Subtotal base: $${descuento.subtotal_base}`)
              console.log(`   - Unidades con descuento: ${descuento.unidades_con_descuento}`)
              console.log(`   - Descuento total: $${descuento.descuento_total}`)
              console.log(`   - Subtotal final: $${descuento.subtotal_final}`)
              if (descuento.promocion_aplicada) {
                console.log(`   - Promoción:`, descuento.promocion_aplicada)
              }
              
              const descuentoTotal = parseFloat(descuento.descuento_total) || 0
              const precioBase = parseFloat(descuento.precio_base) || 0
              
              // Si ya existe un descuento para este producto, comparar y quedarse con el mejor
              if (descuentosMap[descuento.producto_id]) {
                const existente = descuentosMap[descuento.producto_id]
                // Preferir el que tenga mayor descuento total
                if (descuentoTotal > existente.descuento) {
                  descuentosMap[descuento.producto_id] = {
                    descuento: descuentoTotal,
                    promocion: descuento.promocion_aplicada
                  }
                  if (esLeche && esCarrefour) {
                    console.log(`⚠️  DUPLICADO: Reemplazando descuento de $${existente.descuento} por $${descuentoTotal} (precio base: $${precioBase})`)
                  }
                } else if (esLeche && esCarrefour) {
                  console.log(`⚠️  DUPLICADO: Manteniendo descuento mayor de $${existente.descuento} (descartando $${descuentoTotal})`)
                }
              } else {
                descuentosMap[descuento.producto_id] = {
                  descuento: descuentoTotal,
                  promocion: descuento.promocion_aplicada
                }
              }
            })
          }
          console.log(`====================================\n`)

          // Eliminar duplicados por producto_id antes de procesar
          const productosUnicos = {}
          detalleData.forEach(producto => {
            if (!productosUnicos[producto.producto_id]) {
              productosUnicos[producto.producto_id] = producto
            } else {
              // Si ya existe, verificar si este tiene mejor precio o estado
              const existente = productosUnicos[producto.producto_id]
              if (producto.estado_producto === 'DISPONIBLE' && existente.estado_producto !== 'DISPONIBLE') {
                productosUnicos[producto.producto_id] = producto
              } else if (producto.estado_producto === existente.estado_producto && 
                         parseFloat(producto.precio) > parseFloat(existente.precio)) {
                productosUnicos[producto.producto_id] = producto
              }
            }
          })
          
          console.log(`📦 Productos únicos después de filtrar duplicados: ${Object.keys(productosUnicos).length}`)

          productosPrecios = Object.values(productosUnicos).map(producto => {
            const subtotal = parseFloat(producto.subtotal) || 0
            const descuentoInfo = descuentosMap[producto.producto_id] || { descuento: 0, promocion: null }
            const subtotalFinal = subtotal - descuentoInfo.descuento
            
            // Log detallado para productos con descuento o específicamente para leche en Carrefour
            const esLeche = producto.producto_nombre.toLowerCase().includes('leche')
            const esCarrefour = supermercado.nombre.toLowerCase().includes('carrefour')
            
            if (descuentoInfo.descuento > 0 || (esLeche && esCarrefour)) {
              console.log(`\n🔍 === DETALLE DE CALCULO: ${producto.producto_nombre} en ${supermercado.nombre} ===`)
              console.log(`   📊 Cantidad: ${producto.cantidad}`)
              console.log(`   💵 Precio unitario: $${producto.precio}`)
              console.log(`   💰 Subtotal base (sin descuento): $${subtotal}`)
              console.log(`   🎯 Descuento aplicado: $${descuentoInfo.descuento}`)
              console.log(`   📉 Subtotal final (con descuento): $${subtotalFinal}`)
              if (descuentoInfo.promocion) {
                console.log(`   🎁 Promoción:`, descuentoInfo.promocion)
              } else if (esLeche && esCarrefour) {
                console.log(`   ⚠️  NO SE ENCONTRÓ PROMOCIÓN para este producto en ${supermercado.nombre}`)
              }
              console.log(`===========================================\n`)
            }
            
            totalConDescuentosUnitarios += subtotalFinal
            
            return {
              nombre: producto.producto_nombre,
              cantidad: producto.cantidad,
              precio: parseFloat(producto.precio) || 0,
              subtotal: subtotalFinal,
              descuentoAplicado: descuentoInfo.descuento,
              promocionAplicada: descuentoInfo.promocion,
              estado: producto.estado_producto
            }
          })
        } else {
          console.error('❌ Error obteniendo productos:', detalleError)
        }
        
        console.log(`📦 Productos procesados: ${productosPrecios.length}`)
        
        console.log(`💰 Total base ${supermercado.nombre}: $${total}`)
        console.log(`💰 Total con descuentos unitarios: $${totalConDescuentosUnitarios}`)
        
        // OPTIMIZACIÓN: Calcular promociones usando vista optimizada
        const opcionesPorDia = []
        
        console.log(`💳 Calculando promociones para ${supermercado.nombre}...`)
        
        // UNA SOLA QUERY para obtener todas las promociones activas del supermercado
        const { data: promocionesActivas, error: promocionesError } = await supabase
          .from('vista_promociones_medios_pago_activas')
          .select('*')
          .eq('supermercado_id', supermercado.id)

        if (promocionesError) {
          console.error('❌ Error obteniendo promociones:', promocionesError)
          console.log('🔄 Intentando con tabla original...')
          
          // Fallback a la tabla original si la vista no existe
          const { data: promocionesFallback, error: fallbackError } = await supabase
            .from('promociones_medios_pago')
            .select('*')
            .eq('supermercado_id', supermercado.id)
            .eq('activo', true)
            .lte('fecha_inicio', new Date().toISOString().split('T')[0])
            .gte('fecha_fin', new Date().toISOString().split('T')[0])
          
          if (fallbackError) {
            console.error('❌ Error en fallback:', fallbackError)
          } else {
            console.log(`✅ Promociones fallback encontradas: ${promocionesFallback?.length || 0}`)
          }
        } else {
          console.log(`✅ Promociones encontradas: ${promocionesActivas?.length || 0}`)
        }

        // Para cada día, calcular todas las opciones con medio de pago
        // Usar el total con descuentos unitarios como base
        const totalBaseParaPromociones = totalConDescuentosUnitarios > 0 ? totalConDescuentosUnitarios : total
        
        for (const dia of diasSeleccionados) {
          let mejorPrecioDelDia = totalBaseParaPromociones
          let mejorMedioPagoDelDia = null
          let mejorPromocionDelDia = null
          
          // Evaluar cada medio de pago para este día
          for (const medioPagoUser of mediosPagoPref) {
            const medioPago = medioPagoUser.medios_de_pago
            
            // Filtrar promociones en memoria (ya las tenemos)
            const promocionesValidas = promocionesActivas?.filter(promocion => 
              promocion.medio_de_pago_id === medioPago.id &&
              promocion.dias_semana.includes(dia)
            ) || []
            
            // Si hay promociones válidas, calcular descuento
            if (promocionesValidas.length > 0) {
              const promocion = promocionesValidas[0]
              
              // Calcular descuento sobre el total con descuentos unitarios
              const descuentoMaximo = totalBaseParaPromociones * (promocion.descuento_porcentaje / 100)
              const descuentoAplicado = promocion.tope_descuento 
                ? Math.min(descuentoMaximo, promocion.tope_descuento)
                : descuentoMaximo
              
              const totalConDescuento = totalBaseParaPromociones - descuentoAplicado
              
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
      
      // Limpiar carrito temporal si fue creado
      if (carritoTemporalId) {
        try {
          console.log('🧹 Eliminando carrito temporal:', carritoTemporalId)
          // Eliminar productos primero
          await supabase
            .from('productos_x_carrito')
            .delete()
            .eq('carrito_id', carritoTemporalId)
          
          // Eliminar carrito
          await supabase
            .from('carritos_x_usuario')
            .delete()
            .eq('id', carritoTemporalId)
          
          console.log('✅ Carrito temporal eliminado')
        } catch (cleanupError) {
          console.error('⚠️ Error eliminando carrito temporal:', cleanupError)
          // No alertar al usuario, es solo limpieza
        }
      }
      
      // Limpiar productos temporales
      setProductosTemporales(null)
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
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 sm:p-4 bg-white border-2 border-sabu-primary rounded-xl shadow-lg">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M7 18C5.9 18 5.01 18.9 5.01 20S5.9 22 7 22 8.99 21.1 8.99 20 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.5C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20S15.9 22 17 22 18.99 21.1 18.99 20 18.1 18 17 18Z" 
                fill="#0D146B"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Carritos de Compra</h2>
        </div>
        <button 
          onClick={() => setShowNewCarritoModal(true)}
          className="w-full sm:w-auto bg-sabu-primary text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-sabu-primary-dark active:bg-sabu-primary-dark min-h-[48px] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
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
        <div className="space-y-3 sm:space-y-4">
          {carritos.map((carrito) => (
            <div key={carrito.id} className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:border-sabu-primary/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📋</span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{carrito.nombre}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 ml-7 sm:ml-0">
                    {carrito.productos_x_carrito?.length || 0} {carrito.productos_x_carrito?.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleRealizarCompra(carrito)}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-sabu-primary to-sabu-primary-dark text-white px-5 py-3 sm:py-2.5 rounded-xl hover:shadow-lg active:shadow-xl text-sm font-bold min-h-[48px] transition-all duration-200 shadow-md hover:scale-[1.02]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>💰</span>
                      <span>Calcular Compra Óptima</span>
                    </span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCarrito(carrito)}
                      className="flex-1 sm:flex-none bg-blue-50 text-blue-600 active:bg-blue-100 px-4 py-3 sm:px-3 sm:py-2 rounded-lg min-h-[48px] sm:min-h-[36px] font-semibold transition-all duration-200 border border-blue-200"
                      title="Editar carrito"
                    >
                      <span className="sm:hidden">✏️ Editar</span>
                      <span className="hidden sm:inline">✏️</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCarrito(carrito.id)}
                      className="flex-1 sm:flex-none bg-red-50 text-red-600 active:bg-red-100 px-4 py-3 sm:px-3 sm:py-2 rounded-lg min-h-[48px] sm:min-h-[36px] font-semibold transition-all duration-200 border border-red-200"
                      title="Eliminar carrito"
                    >
                      <span className="sm:hidden">🗑️ Eliminar</span>
                      <span className="hidden sm:inline">🗑️</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-xl p-4 sm:p-6 max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">Editar Carrito</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingCarrito(null)
                  setSelectedCategoria(null)
                  setSelectedProductos([])
                  setShowSeleccionadosDrawer(false)
                }}
                className="p-2 text-gray-500 hover:text-gray-700 text-xl font-bold sm:hidden"
              >
                ×
              </button>
            </div>
            
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
                className="w-full px-3 py-3.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary min-h-[48px] text-base sm:text-sm"
                placeholder="Ej: Compra Semanal"
              />
            </div>

            {/* Selección de productos */}
            <div className="flex-1 overflow-hidden flex flex-col sm:flex-row gap-4">
              {/* Panel de Categorías */}
              <div className="w-full sm:w-1/5 border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-4 overflow-y-auto max-h-40 sm:max-h-none">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Categorías</h4>
                <div className="flex sm:flex-col gap-2 sm:space-y-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.id}
                      onClick={() => setSelectedCategoria(categoria.id)}
                      className={`flex-shrink-0 text-left p-2.5 sm:p-3 rounded-lg transition-colors min-h-[44px] ${
                        selectedCategoria === categoria.id
                          ? 'bg-sabu-primary text-white'
                          : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium text-xs sm:text-sm">{categoria.nombre}</div>
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
                              className={`w-full text-left p-3 sm:p-3 rounded-lg border-2 transition-colors min-h-[52px] ${
                                isSelected
                                  ? 'border-sabu-primary bg-green-50'
                                  : 'border-gray-200 active:border-green-300 active:bg-gray-50'
                              }`}
                            >
                              <span className="text-sm sm:text-base">{producto.nombre}</span>
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

              {/* Panel de Productos Seleccionados - Desktop */}
              <div className="hidden sm:block w-1/4 border-l pl-4 overflow-y-auto">
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
                        className="p-3 rounded-lg bg-green-50 border-2 border-green-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm break-words">{p.nombre}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className="flex items-center gap-1 bg-white rounded-lg border-2 border-gray-300">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementarCantidad(p.id)}
                                  className="px-3 py-1.5 text-gray-700 active:bg-gray-100 text-base font-bold min-w-[40px]"
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
                                  className="w-16 px-2 py-1.5 text-center text-sm border-x-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-sabu-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleIncrementarCantidad(p.id)}
                                  className="px-3 py-1.5 text-gray-700 active:bg-gray-100 text-base font-bold min-w-[40px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleProducto(p)}
                            className="text-red-600 active:text-red-700 text-xl leading-none p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
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

            {/* Botón flotante móvil para productos seleccionados */}
            {selectedProductos.length > 0 && (
              <button
                onClick={() => setShowSeleccionadosDrawer(true)}
                className="sm:hidden fixed bottom-20 left-4 right-4 bg-sabu-primary text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-base flex items-center justify-center gap-3 z-40 min-h-[56px]"
              >
                <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                  {selectedProductos.length}
                </span>
                <span>Ver Productos Seleccionados</span>
              </button>
            )}

            {/* Drawer móvil de productos seleccionados */}
            {showSeleccionadosDrawer && (
              <div className="sm:hidden fixed inset-0 z-50">
                {/* Overlay */}
                <div 
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowSeleccionadosDrawer(false)}
                />
                {/* Drawer */}
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="text-lg font-bold text-gray-900">
                      Productos Seleccionados ({selectedProductos.length})
                    </h4>
                    <button
                      onClick={() => setShowSeleccionadosDrawer(false)}
                      className="p-2 text-gray-500 active:text-gray-700 text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedProductos.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No hay productos seleccionados</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedProductos.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 rounded-xl bg-green-50 border-2 border-green-200"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <p className="font-semibold text-gray-900 text-sm flex-1 break-words">{p.nombre}</p>
                              <button
                                onClick={() => {
                                  handleToggleProducto(p)
                                  if (selectedProductos.length === 1) {
                                    setShowSeleccionadosDrawer(false)
                                  }
                                }}
                                className="text-red-600 active:text-red-700 text-2xl leading-none p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                title="Eliminar"
                              >
                                ×
                              </button>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="flex items-center gap-2 bg-white rounded-xl border-2 border-gray-300 shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementarCantidad(p.id)}
                                  className="px-4 py-3 text-gray-700 active:bg-gray-100 text-xl font-bold min-w-[56px]"
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
                                  className="w-20 px-3 py-3 text-center text-base border-x-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-sabu-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleIncrementarCantidad(p.id)}
                                  className="px-4 py-3 text-gray-700 active:bg-gray-100 text-xl font-bold min-w-[56px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Botón Calcular Compra Óptima */}
                  {selectedProductos.length > 0 && (
                    <div className="pt-4 border-t mt-4">
                      <button
                        onClick={handleCalcularCompraDesdeSeleccionados}
                        className="w-full bg-sabu-primary text-white px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 min-h-[56px] shadow-lg active:bg-sabu-primary-dark transition-all"
                      >
                        <span>💰</span>
                        <span>Calcular Compra Óptima</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer con botones */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <button
                  onClick={handleUpdateCarrito}
                  disabled={selectedProductos.length === 0}
                  className="flex-1 bg-sabu-primary text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-sabu-primary-dark active:bg-sabu-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[48px] font-semibold transition-all duration-200"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCarrito(null)
                    setSelectedCategoria(null)
                    setSelectedProductos([])
                    setShowSeleccionadosDrawer(false)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 sm:py-2 rounded-lg active:bg-gray-300 min-h-[48px] font-semibold transition-all duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-xl p-4 sm:p-6 max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">Nuevo Carrito de Compra</h3>
              <button
                onClick={() => {
                  setShowNewCarritoModal(false)
                  setNewCarritoForm({ nombre: '' })
                  setSelectedCategoria(null)
                  setSelectedProductos([])
                  setShowSeleccionadosDrawer(false)
                }}
                className="p-2 text-gray-500 hover:text-gray-700 text-xl font-bold sm:hidden"
              >
                ×
              </button>
            </div>
            
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
                className="w-full px-3 py-3.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary min-h-[48px] text-base sm:text-sm"
                placeholder="Ej: Compra Semanal"
              />
            </div>

            {/* Selección de productos */}
            <div className="flex-1 overflow-hidden flex flex-col sm:flex-row gap-4">
              {/* Panel de Categorías */}
              <div className="w-full sm:w-1/5 border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-4 overflow-y-auto max-h-40 sm:max-h-none">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Categorías</h4>
                <div className="flex sm:flex-col gap-2 sm:space-y-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
                  {categorias.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2 flex-shrink-0">No hay categorías disponibles</p>
                  ) : (
                    categorias.map((categoria) => (
                      <button
                        key={categoria.id}
                        onClick={() => setSelectedCategoria(categoria.id)}
                        className={`flex-shrink-0 text-left p-2.5 sm:p-3 rounded-lg transition-colors min-h-[44px] ${
                          selectedCategoria === categoria.id
                            ? 'bg-sabu-primary text-white'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        <div className="font-medium text-xs sm:text-sm">{categoria.nombre}</div>
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
                              className={`w-full text-left p-3 sm:p-3 rounded-lg border-2 transition-colors min-h-[52px] ${
                                isSelected
                                  ? 'border-sabu-primary bg-green-50'
                                  : 'border-gray-200 active:border-green-300 active:bg-gray-50'
                              }`}
                            >
                              <span className="text-sm sm:text-base">{producto.nombre}</span>
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

              {/* Panel de Productos Seleccionados - Desktop */}
              <div className="hidden sm:block w-1/4 border-l pl-4 overflow-y-auto">
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
                        className="p-3 rounded-lg bg-green-50 border-2 border-green-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm break-words">{p.nombre}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className="flex items-center gap-1 bg-white rounded-lg border-2 border-gray-300">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementarCantidad(p.id)}
                                  className="px-3 py-1.5 text-gray-700 active:bg-gray-100 text-base font-bold min-w-[40px]"
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
                                  className="w-16 px-2 py-1.5 text-center text-sm border-x-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-sabu-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleIncrementarCantidad(p.id)}
                                  className="px-3 py-1.5 text-gray-700 active:bg-gray-100 text-base font-bold min-w-[40px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleProducto(p)}
                            className="text-red-600 active:text-red-700 text-xl leading-none p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
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

            {/* Botón flotante móvil para productos seleccionados */}
            {selectedProductos.length > 0 && (
              <button
                onClick={() => setShowSeleccionadosDrawer(true)}
                className="sm:hidden fixed bottom-20 left-4 right-4 bg-sabu-primary text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-base flex items-center justify-center gap-3 z-40 min-h-[56px]"
              >
                <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                  {selectedProductos.length}
                </span>
                <span>Ver Productos Seleccionados</span>
              </button>
            )}

            {/* Drawer móvil de productos seleccionados */}
            {showSeleccionadosDrawer && (
              <div className="sm:hidden fixed inset-0 z-50">
                {/* Overlay */}
                <div 
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowSeleccionadosDrawer(false)}
                />
                {/* Drawer */}
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="text-lg font-bold text-gray-900">
                      Productos Seleccionados ({selectedProductos.length})
                    </h4>
                    <button
                      onClick={() => setShowSeleccionadosDrawer(false)}
                      className="p-2 text-gray-500 active:text-gray-700 text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedProductos.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No hay productos seleccionados</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedProductos.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 rounded-xl bg-green-50 border-2 border-green-200"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <p className="font-semibold text-gray-900 text-sm flex-1 break-words">{p.nombre}</p>
                              <button
                                onClick={() => {
                                  handleToggleProducto(p)
                                  if (selectedProductos.length === 1) {
                                    setShowSeleccionadosDrawer(false)
                                  }
                                }}
                                className="text-red-600 active:text-red-700 text-2xl leading-none p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                title="Eliminar"
                              >
                                ×
                              </button>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="flex items-center gap-2 bg-white rounded-xl border-2 border-gray-300 shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementarCantidad(p.id)}
                                  className="px-4 py-3 text-gray-700 active:bg-gray-100 text-xl font-bold min-w-[56px]"
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
                                  className="w-20 px-3 py-3 text-center text-base border-x-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-sabu-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleIncrementarCantidad(p.id)}
                                  className="px-4 py-3 text-gray-700 active:bg-gray-100 text-xl font-bold min-w-[56px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Botón Calcular Compra Óptima */}
                  {selectedProductos.length > 0 && (
                    <div className="pt-4 border-t mt-4">
                      <button
                        onClick={handleCalcularCompraDesdeSeleccionados}
                        className="w-full bg-sabu-primary text-white px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 min-h-[56px] shadow-lg active:bg-sabu-primary-dark transition-all"
                      >
                        <span>💰</span>
                        <span>Calcular Compra Óptima</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer con botones */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCreateCarrito}
                  disabled={selectedProductos.length === 0}
                  className="flex-1 bg-sabu-primary text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-sabu-primary-dark active:bg-sabu-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[48px] font-semibold transition-all duration-200"
                >
                  Crear Carrito
                </button>
                <button
                  onClick={() => {
                    setShowNewCarritoModal(false)
                    setNewCarritoForm({ nombre: '' })
                    setSelectedCategoria(null)
                    setSelectedProductos([])
                    setShowSeleccionadosDrawer(false)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 sm:py-2 rounded-lg active:bg-gray-300 min-h-[48px] font-semibold transition-all duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-xl p-4 sm:p-6 max-w-2xl w-full h-full sm:h-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">¿Cuándo vas a realizar la compra?</h3>
              <button
                onClick={() => {
                  setShowDiaSeleccionModal(false)
                  setDiasSeleccionados([])
                  setCarritoSeleccionado(null)
                  setMejorDia(false)
                }}
                className="p-2 text-gray-500 hover:text-gray-700 text-xl font-bold sm:hidden"
              >
                ×
              </button>
            </div>
            
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-xl p-4 sm:p-6 max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">Precios por Supermercado</h3>
              <button
                onClick={() => {
                  setShowPreciosModal(false)
                  setPreciosPorSupermercado([])
                }}
                className="p-2 text-gray-500 hover:text-gray-700 text-xl font-bold sm:hidden"
              >
                ×
              </button>
            </div>
            
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
                      
                      {/* Botón para expandir/colapsar */}
                      <button
                        onClick={() => {
                          const newExpandidos = new Set(productosExpandidos)
                          if (newExpandidos.has(index)) {
                            newExpandidos.delete(index)
                          } else {
                            newExpandidos.add(index)
                          }
                          setProductosExpandidos(newExpandidos)
                        }}
                        className="w-full mt-3 py-2.5 px-4 bg-sabu-primary/10 hover:bg-sabu-primary/20 active:bg-sabu-primary/20 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-semibold text-sabu-primary border border-sabu-primary/30"
                      >
                        <span>{productosExpandidos.has(index) ? 'Ocultar Detalles' : 'Más Detalles'}</span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-200 ${productosExpandidos.has(index) ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Lista de productos expandible */}
                      {productosExpandidos.has(index) && (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          {item.productos.map((prod, prodIndex) => (
                            <div key={prodIndex} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start text-sm">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900">
                                    {prod.nombre}
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    x{prod.cantidad}
                                  </span>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="font-medium text-gray-900">
                                    ${formatPrice(prod.subtotal)}
                                  </div>
                                  {prod.precio && (
                                    <div className="text-xs text-gray-500">
                                      ${formatPrice(prod.precio)} c/u
                                    </div>
                                  )}
                                </div>
                              </div>
                              {prod.descuentoAplicado > 0 && (
                                <div className="text-xs text-green-700 mt-2 pt-2 border-t border-green-200">
                                  💰 Descuento aplicado: ${formatPrice(prod.descuentoAplicado)}
                                  {prod.promocionAplicada && (
                                    <div className="text-green-600 mt-1">
                                      {prod.promocionAplicada.descripcion || 'Promoción unitaria'}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                  setProductosExpandidos(new Set()) // Resetear estados expandidos
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 sm:py-2 rounded-lg active:bg-gray-300 min-h-[48px] font-semibold transition-all duration-200"
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
