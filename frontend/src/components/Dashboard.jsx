import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          telefono,
          supermercados_preferidos_usuario (
            supermercado_id,
            supermercados (
              nombre
            )
          )
        `)
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserData(usuario)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola, {userData?.nombre || 'Usuario'}!
            </h1>
            <p className="text-sm text-gray-600">
              {userData?.telefono && `📱 ${userData.telefono}`}
            </p>
          </div>
          <button
            onClick={signOut}
            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🏪 Tus Supermercados Preferidos
              </h2>
              {userData?.supermercados_preferidos_usuario?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userData.supermercados_preferidos_usuario.map((pref, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {pref.supermercados.nombre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay supermercados configurados</p>
              )}
            </div>

            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-4">Tu Dashboard de SABU</p>
                <p className="text-gray-400 text-sm">
                  Aquí verás tus carritos, ofertas y ahorros
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}