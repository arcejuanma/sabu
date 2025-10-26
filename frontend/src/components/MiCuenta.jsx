import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function MiCuenta({ onClose }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [supermercadosDisponibles, setSupermercadosDisponibles] = useState([])
  const [formData, setFormData] = useState({
    telefono: '',
    direccion: '',
    altura: '',
    codigoPostal: '',
    supermercados: []
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Loading data, user:', user)
        
        if (!user || !user.id) {
          console.error('❌ No user available')
          setInitialLoading(false)
          return
        }
        
        await Promise.all([fetchUserData(), fetchSupermercados()])
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
        supermercados: []
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
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Mi Cuenta</h2>

        <form onSubmit={handleSubmit}>
          {/* Teléfono */}
          <div className="mb-4">
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

          {/* Dirección */}
          <div className="mb-4">
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

          {/* Altura */}
          <div className="mb-4">
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

          {/* Código Postal */}
          <div className="mb-6">
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

          {/* Supermercados Preferidos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supermercados Preferidos
            </label>
            <div className="space-y-2">
              {supermercadosDisponibles.map((supermercado) => (
                <label key={supermercado.id} className="flex items-center space-x-2 cursor-pointer">
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

          {/* Botones */}
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
