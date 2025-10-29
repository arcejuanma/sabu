import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabase } from '../lib/supabase'
import Logo from './Logo'

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
    supermercados: [],
    mediosPago: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Datos básicos, 2: Dirección, 3: Supermercados, 4: Medios de pago
  const [supermercadosDisponibles, setSupermercadosDisponibles] = useState([])
  const [loadingSupermercados, setLoadingSupermercados] = useState(true)
  const [mediosPagoDisponibles, setMediosPagoDisponibles] = useState([])
  const [bancosDisponibles, setBancosDisponibles] = useState([])
  const [loadingMediosPago, setLoadingMediosPago] = useState(true)

  // Cargar supermercados y medios de pago desde la base de datos
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

    const fetchMediosPago = async () => {
      console.log('🔄 Iniciando carga de medios de pago...')
      try {
        const { data: medios, error } = await supabase
          .from('medios_de_pago')
          .select('id, nombre, banco, tipo')
          .eq('activo', true)
          .order('banco, nombre')

        if (error) {
          console.error('❌ Error cargando medios de pago:', error)
          return
        }

        if (!medios || medios.length === 0) {
          console.warn('⚠️ No se encontraron medios de pago')
          return
        }

        // Extraer bancos únicos
        const bancos = [...new Set(medios.map(m => m.banco))].sort()
        setBancosDisponibles(bancos)
        setMediosPagoDisponibles(medios)
      } catch (error) {
        console.error('💥 Error en fetchMediosPago:', error)
      } finally {
        setLoadingMediosPago(false)
      }
    }

    console.log('🚀 Ejecutando useEffect para cargar datos')
    fetchSupermercados()
    fetchMediosPago()
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

  const handleMedioPagoToggle = (medioPagoId) => {
    setFormData(prev => ({
      ...prev,
      mediosPago: prev.mediosPago.includes(medioPagoId)
        ? prev.mediosPago.filter(id => id !== medioPagoId)
        : [...prev.mediosPago, medioPagoId]
    }))
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
    } else if (step === 3) {
      if (formData.supermercados.length > 0) {
        setStep(4)
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

  // Indicador de progreso
  const progressSteps = [
    { num: 1, label: 'Datos', icon: '👤' },
    { num: 2, label: 'Dirección', icon: '📍' },
    { num: 3, label: 'Supermercados', icon: '🏪' },
    { num: 4, label: 'Medios de Pago', icon: '💳' }
  ]

  const ProgressIndicator = () => (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-2">
        {progressSteps.map((s, idx) => (
          <div key={s.num} className="flex-1 flex flex-col items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-200 ${
              step > s.num ? 'bg-sabu-primary text-white' :
              step === s.num ? 'bg-sabu-primary text-white scale-110 shadow-lg' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step > s.num ? '✓' : s.icon}
            </div>
            <span className={`mt-1 text-xs sm:text-sm font-medium hidden sm:block ${
              step >= s.num ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        {progressSteps.map((s, idx) => (
          <div key={s.num} className={`flex-1 h-1 rounded-full transition-all duration-200 ${
            step > s.num ? 'bg-sabu-primary' :
            step === s.num ? 'bg-sabu-primary' :
            'bg-gray-200'
          } ${idx < progressSteps.length - 1 ? 'mr-2' : ''}`} />
        ))}
      </div>
      <div className="text-center mt-2">
        <span className="text-xs sm:text-sm text-gray-600">Paso {step} de 4</span>
      </div>
    </div>
  )

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg mb-4">
              <Logo size={56} />
            </div>
            <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
              ¡Bienvenido a SABU!
            </h2>
            <p className="mt-2 text-base sm:text-lg text-gray-600">
              Contanos un poco sobre vos para personalizar tu experiencia
            </p>
          </div>

          <ProgressIndicator />

          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary min-h-[48px]"
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
                    className="w-full px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary min-h-[48px]"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="flex gap-2">
                  <div className="w-20 sm:w-20">
                    <input
                      type="text"
                      value={formData.codigoPais}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigoPais: e.target.value }))}
                      className="w-full px-2 sm:px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary text-center min-h-[48px] text-sm"
                      placeholder="+54"
                    />
                  </div>
                  <div className="w-24 sm:w-24">
                    <input
                      type="text"
                      value={formData.codigoArea}
                      onChange={handleCodigoAreaChange}
                      className="w-full px-2 sm:px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary text-center min-h-[48px] text-sm"
                      placeholder="11"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={handleNumeroChange}
                      className="w-full px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary text-center min-h-[48px] text-sm"
                      placeholder="1234-5678"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ejemplo: +54 11 1234-5678
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.nombre || !formData.apellido || !formData.codigoArea || !formData.numero}
                className="w-full flex justify-center py-4 sm:py-3 px-4 border border-transparent rounded-lg shadow-lg text-base sm:text-sm font-bold text-white bg-gradient-to-r from-sabu-primary to-sabu-primary-dark hover:from-sabu-primary-dark hover:to-sabu-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] transition-all duration-200"
              >
                Continuar →
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <ProgressIndicator />
          
          <div className="text-center mb-6 sm:mb-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl sm:text-3xl">📍</span>
            </div>
            <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
              ¿Dónde vivís?
            </h2>
            <p className="mt-2 text-base sm:text-lg text-gray-600">
              Necesitamos tu dirección para encontrar supermercados cercanos
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="space-y-5 sm:space-y-6">
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
                  className="w-full px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary min-h-[48px]"
                  placeholder="Ej: Av. Corrientes"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary min-h-[48px]"
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
                    className="w-full px-3 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary min-h-[48px]"
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

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 sm:py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-base sm:text-sm font-semibold text-gray-700 bg-white active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary min-h-[52px] transition-all duration-200"
              >
                ← Atrás
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.direccion || !formData.altura || !formData.codigoPostal}
                className="flex-1 flex justify-center py-4 sm:py-3 px-4 border border-transparent rounded-lg shadow-lg text-base sm:text-sm font-bold text-white bg-gradient-to-r from-sabu-primary to-sabu-primary-dark hover:from-sabu-primary-dark hover:to-sabu-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] transition-all duration-200"
              >
                Continuar →
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Paso 3: Supermercados
  if (step === 3) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <ProgressIndicator />
        
        <div className="text-center mb-6 sm:mb-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl sm:text-3xl">🏪</span>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            ¿Dónde comprás?
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Seleccioná los supermercados donde querés que busquemos ofertas
          </p>
        </div>

          {loadingSupermercados ? (
          <div className="flex items-center justify-center py-8 bg-white rounded-xl shadow-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sabu-primary"></div>
              <span className="ml-2 text-gray-600">Cargando supermercados...</span>
            </div>
          ) : supermercadosDisponibles.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-lg p-6">
              <div className="text-gray-500 mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <p>No se pudieron cargar los supermercados</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sabu-primary text-white rounded-md hover:bg-sabu-primary-dark min-h-[48px]"
              >
                Reintentar
              </button>
            </div>
          ) : (
          <>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <div className="space-y-3 sm:space-y-4">
              {supermercadosDisponibles.map((supermercado) => (
                <div
                  key={supermercado.id}
                    className={`relative flex items-center p-4 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 min-h-[64px] ${
                    formData.supermercados.includes(supermercado.id)
                        ? 'border-sabu-primary bg-green-50 shadow-md'
                        : 'border-gray-300 active:border-gray-400 active:bg-gray-50'
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
                        className="h-4 w-4 text-sabu-primary focus:ring-sabu-primary border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>

            {formData.supermercados.length === 0 && (
              <div className="mt-4 text-center bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-gray-500">
                  Seleccioná al menos un supermercado para continuar
                </p>
              </div>
            )}

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-4 sm:py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-base sm:text-sm font-semibold text-gray-700 bg-white active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary min-h-[52px] transition-all duration-200"
              >
                ← Atrás
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={formData.supermercados.length === 0}
                className="flex-1 flex justify-center py-4 sm:py-3 px-4 border border-transparent rounded-lg shadow-lg text-base sm:text-sm font-bold text-white bg-gradient-to-r from-sabu-primary to-sabu-primary-dark hover:from-sabu-primary-dark hover:to-sabu-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] transition-all duration-200"
              >
                Continuar →
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    )
  }

  // Paso 4: Medios de pago
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <ProgressIndicator />
        
        <div className="text-center mb-6 sm:mb-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl sm:text-3xl">💳</span>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Tus medios de pago
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Seleccioná los medios de pago que usás para optimizar tus compras
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {loadingMediosPago ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sabu-primary"></div>
              <span className="ml-2 text-gray-600">Cargando medios de pago...</span>
            </div>
          ) : bancosDisponibles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <p>No se pudieron cargar los medios de pago</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-sabu-primary text-white rounded-md hover:bg-sabu-primary-dark"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <div className="space-y-4 sm:space-y-6">
                {bancosDisponibles.map((banco) => (
                  <div key={banco}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{banco}</h3>
                    <div className="space-y-2 sm:space-y-2">
                      {mediosPagoDisponibles
                        .filter(medio => medio.banco === banco)
                        .map((medio) => (
                          <label
                            key={medio.id}
                            className={`flex items-center p-4 sm:p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 min-h-[56px] ${
                              formData.mediosPago.includes(medio.id)
                                ? 'border-sabu-primary bg-green-50 shadow-md'
                                : 'border-gray-300 active:border-gray-400 active:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.mediosPago.includes(medio.id)}
                              onChange={() => handleMedioPagoToggle(medio.id)}
                              className="w-5 h-5 sm:w-4 sm:h-4 text-sabu-primary border-gray-300 rounded focus:ring-sabu-primary flex-shrink-0"
                            />
                            <span className="ml-3 text-sm sm:text-sm font-medium text-gray-900 flex-1">
                              {medio.nombre}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.mediosPago.length === 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Seleccioná al menos un medio de pago
              </p>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-4 sm:py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-base sm:text-sm font-semibold text-gray-700 bg-white active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary min-h-[52px] transition-all duration-200"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={formData.mediosPago.length === 0 || isLoading}
              className="flex-1 flex justify-center items-center py-4 sm:py-3 px-4 border border-transparent rounded-lg shadow-lg text-base sm:text-sm font-bold text-white bg-gradient-to-r from-sabu-primary to-sabu-primary-dark hover:from-sabu-primary-dark hover:to-sabu-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Guardando...
                </div>
              ) : (
                '✓ Finalizar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
