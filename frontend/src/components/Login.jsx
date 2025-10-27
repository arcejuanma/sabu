import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Logo from './Logo'

export default function Login() {
  const { signInWithMagicLink, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [linkSent, setLinkSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      await signInWithMagicLink(email)
      setLinkSent(true)
    } catch (error) {
      setMessage('Error al enviar el email. Intentá nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabu-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (linkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ¡Revisá tu email!
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Te enviamos un link de acceso a <strong>{email}</strong>
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ¿Qué hacer ahora?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-sabu-primary mr-2">1.</span>
                  <span>Revisá tu bandeja de entrada</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sabu-primary mr-2">2.</span>
                  <span>Buscá el email de SABU</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sabu-primary mr-2">3.</span>
                  <span>Hacé clic en "Acceder a SABU"</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sabu-primary mr-2">4.</span>
                  <span>¡Listo! Ya estás dentro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setLinkSent(false)
                setEmail('')
                setMessage('')
              }}
              className="text-sabu-primary hover:text-green-500 text-sm font-medium"
            >
              ← Enviar a otro email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center">
            <Logo size={64} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bienvenido a SABU
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ahorrá tiempo y dinero en tus compras
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sabu-primary focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Ingresá tu email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sabu-primary hover:bg-sabu-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">📧</span>
                  Enviar Link de Acceso
                </div>
              )}
            </button>
          </div>

          {message && (
            <div className={`text-center text-sm ${
              message.includes('Revisá') ? 'text-sabu-primary' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Te enviaremos un link por email para acceder sin contraseña
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
