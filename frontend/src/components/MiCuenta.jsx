import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function MiCuenta({ onClose }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('datos') // 'datos', 'supermercados', 'medios'
  const [supermercadosDisponibles, setSupermercadosDisponibles] = useState([])
  const [formData, setFormData] = useState({
    telefono: '',
    direccion: '',
    altura: '',
    codigoPostal: '',
    supermercados: [],
    mediosPago: []
  })
  const [mediosPagoDisponibles, setMediosPagoDisponibles] = useState([])
  const [bancosDisponibles, setBancosDisponibles] = useState([])
  const [loadingMediosPago, setLoadingMediosPago] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Loading data, user:', user)
        
        if (!user || !user.id) {
          console.error('❌ No user available')
          setInitialLoading(false)
          return
        }
        
        await Promise.all([fetchUserData(), fetchSupermercados(), fetchMediosPago()])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    loadData()
  }, [user]) // Agregar user como dependencia

  const fetchUserData = async () => {
    try {
      console.log('📥 fetchUserData called, user:', user)
      
      if (!user || !user.id) {
        console.error('❌ No user found in fetchUserData')
        return
      }

      console.log('📥 Fetching user data for:', user.id)
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('telefono, direccion, altura, codigo_postal')
        .eq('id', user.id)

      if (error) {
        console.error('❌ Error in Supabase query:', error)
        alert(`Error al cargar datos: ${error.message}`)
        return
      }

      console.log('👤 User data received:', data)

      // Si no hay datos, usar valores vacíos
      const userData = data && data.length > 0 ? data[0] : null

      setFormData({
        telefono: userData?.telefono || '',
        direccion: userData?.direccion || '',
        altura: userData?.altura || '',
        codigoPostal: userData?.codigo_postal || '',
        supermercados: [],
        mediosPago: []
      })

      // Obtener supermercados preferidos
      const { data: prefs, error: prefsError } = await supabase
        .from('supermercados_preferidos_usuario')
        .select('supermercado_id')
        .eq('usuario_id', user.id)
        .eq('activo', true)

      if (prefsError) {
        console.error('❌ Error fetching preferred supermarkets:', prefsError)
      } else {
        console.log('🏪 Preferred supermarkets:', prefs)

        if (prefs) {
          setFormData(prev => ({
            ...prev,
            supermercados: prefs.map(p => p.supermercado_id)
          }))
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
      console.error('Error details:', error)
      alert(`Error al cargar los datos del usuario: ${error.message || 'Error desconocido'}`)
    }
  }

  const fetchSupermercados = async () => {
    try {
      const { data, error } = await supabase
        .from('supermercados')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setSupermercadosDisponibles(data || [])
    } catch (error) {
      console.error('Error fetching supermercados:', error)
    }
  }

  const fetchMediosPago = async () => {
    try {
      setLoadingMediosPago(true)
      
      console.log('🔄 Fetching medios de pago...')
      
      // Cargar medios de pago disponibles
      const { data: medios, error } = await supabase
        .from('medios_de_pago')
        .select('id, nombre, banco, tipo')
        .eq('activo', true)
        .order('banco, nombre')

      console.log('📊 Medios de pago query result:', { medios, error })

      if (error) {
        console.error('❌ Error fetching medios de pago:', error)
        throw error
      }

      if (!medios || medios.length === 0) {
        console.warn('⚠️ No se encontraron medios de pago en la base de datos')
        setMediosPagoDisponibles([])
        setBancosDisponibles([])
        return
      }

      console.log('✅ Medios de pago encontrados:', medios.length)

      // Extraer bancos únicos
      const bancos = [...new Set(medios.map(m => m.banco))].sort()
      setBancosDisponibles(bancos)
      setMediosPagoDisponibles(medios)

      console.log('🏦 Bancos encontrados:', bancos)

      // Cargar medios de pago del usuario
      if (user && user.id) {
        const { data: prefs, error: prefsError } = await supabase
          .from('medios_de_pago_x_usuario')
          .select('medio_de_pago_id')
          .eq('usuario_id', user.id)
          .eq('activo', true)

        if (prefsError) {
          console.error('❌ Error fetching preferred payment methods:', prefsError)
        } else if (prefs) {
          setFormData(prev => ({
            ...prev,
            mediosPago: prefs.map(p => p.medio_de_pago_id)
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching medios de pago:', error)
    } finally {
      setLoadingMediosPago(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSupermercadoToggle = (supermercadoId) => {
    setFormData(prev => ({
      ...prev,
      supermercados: prev.supermercados.includes(supermercadoId)
        ? prev.supermercados.filter(id => id !== supermercadoId)
        : [...prev.supermercados, supermercadoId]
    }))
  }

  const handleMedioPagoToggle = (medioPagoId) => {
    setFormData(prev => ({
      ...prev,
      mediosPago: prev.mediosPago.includes(medioPagoId)
        ? prev.mediosPago.filter(id => id !== medioPagoId)
        : [...prev.mediosPago, medioPagoId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('💾 Saving user data:', formData)
      
      // Actualizar datos del usuario
      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          telefono: formData.telefono,
          direccion: formData.direccion,
          altura: formData.altura,
          codigo_postal: formData.codigoPostal
        })
        .eq('id', user.id)

      if (userError) {
        console.error('❌ Error updating user:', userError)
        throw userError
      }

      console.log('✅ User data updated successfully')

      // Obtener todos los supermercados preferidos actuales del usuario
      const { data: currentPrefs } = await supabase
        .from('supermercados_preferidos_usuario')
        .select('id, supermercado_id, activo')
        .eq('usuario_id', user.id)

      console.log('🔍 Current preferred supermarkets:', currentPrefs)

      // Procesar cada supermercado seleccionado
      if (formData.supermercados.length > 0) {
        for (const supermercadoId of formData.supermercados) {
          const { data: existing } = await supabase
            .from('supermercados_preferidos_usuario')
            .select('id, activo')
            .eq('usuario_id', user.id)
            .eq('supermercado_id', supermercadoId)
            .maybeSingle()

          if (existing) {
            // Si existe pero está inactivo, activarlo
            if (!existing.activo) {
              await supabase
                .from('supermercados_preferidos_usuario')
                .update({ activo: true })
                .eq('id', existing.id)
            }
          } else {
            // Crear nuevo
            await supabase
              .from('supermercados_preferidos_usuario')
              .insert({
                usuario_id: user.id,
                supermercado_id: supermercadoId,
                activo: true
              })
          }
        }
      }

      // Desactivar los que ya no están en la lista seleccionada
      if (currentPrefs && currentPrefs.length > 0) {
        for (const pref of currentPrefs) {
          if (!formData.supermercados.includes(pref.supermercado_id)) {
            console.log('🗑️ Deactivating supermarket:', pref.supermercado_id)
            await supabase
              .from('supermercados_preferidos_usuario')
              .update({ activo: false })
              .eq('id', pref.id)
          }
        }
      }

      // Procesar medios de pago
      const { data: currentMedios } = await supabase
        .from('medios_de_pago_x_usuario')
        .select('id, medio_de_pago_id, activo')
        .eq('usuario_id', user.id)

      // Procesar cada medio de pago seleccionado
      if (formData.mediosPago.length > 0) {
        for (const medioPagoId of formData.mediosPago) {
          const { data: existing } = await supabase
            .from('medios_de_pago_x_usuario')
            .select('id, activo')
            .eq('usuario_id', user.id)
            .eq('medio_de_pago_id', medioPagoId)
            .maybeSingle()

          if (existing) {
            if (!existing.activo) {
              await supabase
                .from('medios_de_pago_x_usuario')
                .update({ activo: true })
                .eq('id', existing.id)
            }
          } else {
            await supabase
              .from('medios_de_pago_x_usuario')
              .insert({
                usuario_id: user.id,
                medio_de_pago_id: medioPagoId,
                activo: true
              })
          }
        }
      }

      // Desactivar los medios de pago que ya no están en la lista
      if (currentMedios && currentMedios.length > 0) {
        for (const medio of currentMedios) {
          if (!formData.mediosPago.includes(medio.medio_de_pago_id)) {
            await supabase
              .from('medios_de_pago_x_usuario')
              .update({ activo: false })
              .eq('id', medio.id)
          }
        }
      }

      alert('¡Datos actualizados exitosamente!')
      onClose()
      // Recargar después de un pequeño delay para dar tiempo a que se guarden los cambios
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error updating user data:', error)
      console.error('Error details:', error.message)
      alert(`Error al actualizar los datos: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-700 mb-4">No se pudo cargar la información del usuario. Por favor, cierra sesión y vuelve a iniciar sesión.</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Mi Cuenta</h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('datos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'datos'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👤 Datos Personales
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('supermercados')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'supermercados'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏪 Supermercados
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('medios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'medios'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💳 Medios de Pago
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tab: Datos Personales */}
          {activeTab === 'datos' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Calle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura
                  </label>
                  <input
                    type="text"
                    name="altura"
                    value={formData.altura}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="C1234ABC"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Supermercados */}
          {activeTab === 'supermercados' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Seleccioná los supermercados donde querés que busquemos ofertas
              </p>
              <div className="space-y-2">
                {supermercadosDisponibles.map((supermercado) => (
                  <label key={supermercado.id} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.supermercados.includes(supermercado.id)}
                      onChange={() => handleSupermercadoToggle(supermercado.id)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{supermercado.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Medios de Pago */}
          {activeTab === 'medios' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Seleccioná los medios de pago que usás para optimizar tus compras
              </p>
              {loadingMediosPago ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Cargando...</span>
                </div>
              ) : bancosDisponibles.length === 0 ? (
                <p className="text-sm text-gray-500">No hay medios de pago disponibles</p>
              ) : (
                <div className="space-y-4">
                  {bancosDisponibles.map((banco) => (
                    <div key={banco}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">{banco}</h3>
                      <div className="space-y-2">
                        {mediosPagoDisponibles
                          .filter(medio => medio.banco === banco)
                          .map((medio) => (
                            <label key={medio.id} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={formData.mediosPago.includes(medio.id)}
                                onChange={() => handleMedioPagoToggle(medio.id)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">{medio.nombre}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones */}
        <form onSubmit={handleSubmit} className="mt-6 pt-4 border-t">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
