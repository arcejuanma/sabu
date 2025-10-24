import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOnboarding } from '../hooks/useOnboarding'

export default function Onboarding() {
  const { user } = useAuth()
  const { completeOnboarding } = useOnboarding()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    supermercados: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Datos básicos, 2: Supermercados

  const supermercadosDisponibles = [
    { id: 'disco', nombre: 'Disco', icon: '🛒' },
    { id: 'carrefour', nombre: 'Carrefour', icon: '🏪' },
    { id: 'jumbo', nombre: 'Jumbo', icon: '🛍️' },
    { id: 'coto', nombre: 'Coto', icon: '🏬' },
    { id: 'dia', nombre: 'Día', icon: '🛒' },
    { id: 'chango-mas', nombre: 'Chango Más', icon: '🛒' }
  ]

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

  const handleNext = () => {
    if (step === 1) {
      if (formData.nombre && formData.apellido && formData.telefono) {
        setStep(2)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await completeOnboarding(formData)
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
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.nombre || !formData.apellido || !formData.telefono}
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
              onClick={() => setStep(1)}
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
