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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-sabu-primary border-t-transparent mx-auto shadow-lg"></div>
          <p className="mt-6 text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (linkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 shadow-lg animate-bounce-slow">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
              ¡Revisá tu email!
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Te enviamos un link de acceso a
            </p>
            <p className="mt-1 text-base font-semibold text-sabu-primary">
              {email}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                ¿Qué hacer ahora?
              </h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-sabu-primary text-white font-bold text-xs">1</span>
                  <span className="flex-1 text-left">Revisá tu bandeja de entrada</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-sabu-primary text-white font-bold text-xs">2</span>
                  <span className="flex-1 text-left">Buscá el email de SABU</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-sabu-primary text-white font-bold text-xs">3</span>
                  <span className="flex-1 text-left">Hacé clic en "Acceder a SABU"</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-sabu-primary text-white font-bold text-xs">4</span>
                  <span className="flex-1 text-left">¡Listo! Ya estás dentro</span>
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
              className="text-sabu-primary hover:text-sabu-primary-dark text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>←</span>
              <span>Enviar a otro email</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="animate-fade-in">
          <div className="mx-auto flex items-center justify-center p-4 bg-white rounded-2xl shadow-lg">
            <Logo size={72} />
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            Bienvenido a SABU
          </h2>
          <p className="mt-3 text-center text-base text-gray-600 font-medium">
            Ahorrá tiempo y dinero en tus compras
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="appearance-none rounded-lg relative block w-full px-4 py-3.5 border-2 border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sabu-primary focus:border-sabu-primary transition-all duration-200 sm:text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-sabu-primary to-sabu-primary-dark hover:from-sabu-primary-dark hover:to-sabu-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabu-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2 text-xl">📧</span>
                  <span>Enviar Link de Acceso</span>
                </div>
              )}
            </button>
          </div>

          {message && (
            <div className={`text-center text-sm font-medium p-3 rounded-lg ${
              message.includes('Revisá') || message.includes('email') ? 'text-sabu-primary bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Te enviaremos un link por email para acceder sin contraseña
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
