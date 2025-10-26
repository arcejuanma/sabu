import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabase } from '../lib/supabase'

export default function Onboarding() {
  const { user } = useAuth()
  const { completeOnboarding } = useOnboarding()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    codigoPais: '+54',
    codigoArea: '',
    numero: '',
    direccion: '',
    altura: '',
    codigoPostal: '',
    supermercados: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Datos básicos, 2: Dirección, 3: Supermercados
  const [supermercadosDisponibles, setSupermercadosDisponibles] = useState([])
  const [loadingSupermercados, setLoadingSupermercados] = useState(true)

  // Cargar supermercados desde la base de datos
  useEffect(() => {
    const fetchSupermercados = async () => {
      console.log('🔄 Iniciando carga de supermercados...')
      try {
        console.log('📡 Haciendo consulta a Supabase...')
        const { data: supermercados, error } = await supabase
          .from('supermercados')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre')

        console.log('📊 Respuesta de Supabase:', { supermercados, error })

        if (error) {
          console.error('❌ Error cargando supermercados:', error)
          return
        }

        if (!supermercados || supermercados.length === 0) {
          console.warn('⚠️ No se encontraron supermercados en la base de datos')
          return
        }

        // Agregar iconos a los supermercados
        const supermercadosConIconos = supermercados.map(supermercado => ({
          ...supermercado,
          icon: getIconForSupermercado(supermercado.nombre)
        }))

        console.log('✅ Supermercados procesados:', supermercadosConIconos)
        setSupermercadosDisponibles(supermercadosConIconos)
      } catch (error) {
        console.error('💥 Error en fetchSupermercados:', error)
      } finally {
        console.log('🏁 Finalizando carga de supermercados')
        setLoadingSupermercados(false)
      }
    }

    console.log('🚀 Ejecutando useEffect para cargar supermercados')
    fetchSupermercados()
  }, [])

  const getIconForSupermercado = (nombre) => {
    const iconos = {
      'Disco': '🛒',
      'Carrefour': '🏪',
      'Jumbo': '🛍️',
      'Coto': '🏬',
      'Día': '🛒',
      'Chango Más': '🛒'
    }
    return iconos[nombre] || '🛒'
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCodigoAreaChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Solo números
    if (value.length <= 4) {
      setFormData(prev => ({
        ...prev,
        codigoArea: value
      }))
    }
  }

  const handleNumeroChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Solo números
    if (value.length <= 8) {
      setFormData(prev => ({
        ...prev,
        numero: value
      }))
    }
  }

  const getTelefonoCompleto = () => {
    return `${formData.codigoPais} ${formData.codigoArea} ${formData.numero}`.trim()
  }

  const handleSupermercadoToggle = (supermercadoId) => {
    // No permitir duplicados - si ya está seleccionado, quitarlo
    setFormData(prev => ({
      ...prev,
      supermercados: prev.supermercados.includes(supermercadoId)
        ? prev.supermercados.filter(id => id !== supermercadoId)
        : [...prev.supermercados, supermercadoId]
    }))
    console.log('Supermercados seleccionados:', formData.supermercados)
  }

  const handleNext = () => {
    if (step === 1) {
      if (formData.nombre && formData.apellido && formData.codigoArea && formData.numero) {
        setStep(2)
      }
    } else if (step === 2) {
      if (formData.direccion && formData.altura && formData.codigoPostal) {
        setStep(3)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Crear objeto con teléfono completo
      const datosCompletos = {
        ...formData,
        telefono: getTelefonoCompleto()
      }
      
      console.log('Datos completos a enviar:', datosCompletos)
      console.log('Supermercados seleccionados:', formData.supermercados)
      
      await completeOnboarding(datosCompletos)
      // El hook manejará la redirección automáticamente
      console.log('Onboarding completado exitosamente')
      
      // Forzar recarga de la página para actualizar el estado
      window.location.reload()
      
    } catch (error) {
      console.error('Error en onboarding:', error)
      alert('Error al guardar los datos. Intentá nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ¡Bienvenido a SABU!
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Contanos un poco sobre vos para personalizar tu experiencia
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="flex space-x-2">
                  <div className="w-20">
                    <input
                      type="text"
                      value={formData.codigoPais}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigoPais: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-center"
                      placeholder="+54"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="text"
                      value={formData.codigoArea}
                      onChange={handleCodigoAreaChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-center"
                      placeholder="11"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={handleNumeroChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-center"
                      placeholder="1234-5678"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ejemplo: +54 11 1234-5678
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.nombre || !formData.apellido || !formData.codigoArea || !formData.numero}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">📍</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ¿Dónde vivís?
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Necesitamos tu dirección para encontrar supermercados cercanos
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-6">
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Av. Corrientes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-2">
                    Altura
                  </label>
                  <input
                    id="altura"
                    name="altura"
                    type="text"
                    required
                    value={formData.altura}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="1234"
                  />
                </div>
                <div>
                  <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    id="codigoPostal"
                    name="codigoPostal"
                    type="text"
                    required
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="C1043"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-400">ℹ️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Esta información nos ayuda a encontrar supermercados cercanos y ofertas relevantes para tu zona.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.direccion || !formData.altura || !formData.codigoPostal}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">🏪</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¿Dónde comprás?
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Seleccioná los supermercados donde querés que busquemos ofertas
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {loadingSupermercados ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Cargando supermercados...</span>
            </div>
          ) : supermercadosDisponibles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <p>No se pudieron cargar los supermercados</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {supermercadosDisponibles.map((supermercado) => (
                <div
                  key={supermercado.id}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.supermercados.includes(supermercado.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleSupermercadoToggle(supermercado.id)}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{supermercado.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {supermercado.nombre}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <input
                      type="checkbox"
                      checked={formData.supermercados.includes(supermercado.id)}
                      onChange={() => handleSupermercadoToggle(supermercado.id)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.supermercados.length === 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Seleccioná al menos un supermercado para continuar
              </p>
            </div>
          )}

          <div className="mt-8 flex space-x-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={formData.supermercados.length === 0 || isLoading}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Finalizar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
