import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Carritos from './Carritos'
import MiCuenta from './MiCuenta'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMiCuenta, setShowMiCuenta] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) {
      console.log('No user found, skipping fetchUserData')
      setLoading(false)
      return
    }

    try {
      console.log('Fetching user data for:', user.id)
      // Fetch user basic data
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          apellido,
          telefono,
          direccion,
          altura,
          codigo_postal
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        throw error
      }

      // Fetch supermercados preferidos
      const { data: supermercados, error: superError } = await supabase
        .from('supermercados_preferidos_usuario')
        .select(`
          supermercado_id,
          supermercados (
            nombre
          )
        `)
        .eq('usuario_id', user.id)
        .eq('activo', true)

      if (superError) {
        console.error('Error fetching supermercados:', superError)
      } else {
        usuario.supermercados_preferidos_usuario = supermercados
      }

      // Fetch medios de pago
      const { data: mediosPago, error: mediosError } = await supabase
        .from('medios_de_pago_x_usuario')
        .select(`
          medio_de_pago_id,
          medios_de_pago (
            nombre,
            banco
          )
        `)
        .eq('usuario_id', user.id)
        .eq('activo', true)

      if (mediosError) {
        console.error('Error fetching medios de pago:', mediosError)
      } else {
        usuario.medios_de_pago_x_usuario = mediosPago || []
      }

      console.log('User data fetched:', usuario)
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
              ¡Hola, {userData?.nombre 
                ? `${userData.nombre} ` 
                : 'Usuario'}!
            </h1>
            <p className="text-sm text-gray-600">
              {userData?.telefono && `📱 ${userData.telefono}`}
            </p>
            {userData?.direccion && userData?.altura && userData?.codigo_postal && (
              <p className="text-sm text-gray-600">
                📍 {userData.direccion} {userData.altura}, {userData.codigo_postal}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMiCuenta(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Mi Cuenta
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
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

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                💳 Tus Medios de Pago
              </h2>
              {userData?.medios_de_pago_x_usuario?.length > 0 ? (
                <div className="space-y-3">
                  {/* Agrupar por banco */}
                  {Object.entries(
                    userData.medios_de_pago_x_usuario.reduce((acc, mp) => {
                      const banco = mp.medios_de_pago.banco
                      if (!acc[banco]) acc[banco] = []
                      acc[banco].push(mp.medios_de_pago)
                      return acc
                    }, {})
                  ).map(([banco, medios]) => (
                    <div key={banco} className="pb-3 border-b border-gray-200 last:border-b-0 last:pb-0">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{banco}</p>
                      <div className="flex flex-wrap gap-2">
                        {medios.map((medio, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {medio.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay medios de pago configurados</p>
              )}
            </div>

            <Carritos />
          </div>
        </div>
      </main>

      {showMiCuenta && <MiCuenta onClose={() => setShowMiCuenta(false)} />}
    </div>
  )
}