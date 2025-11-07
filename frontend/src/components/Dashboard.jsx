import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Carritos from './Carritos'
import MiCuenta from './MiCuenta'
import Logo from './Logo'

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabu-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-3 sm:py-5 px-3 sm:px-4 lg:px-8">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-white border-2 border-sabu-secondary rounded-lg shadow-md flex items-center justify-center">
                  <Logo size={52} />
                </div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  ¡Hola, {userData?.nombre 
                    ? `${userData.nombre.split(' ')[0]}` 
                    : 'Usuario'}!
                </h1>
              </div>
            </div>
            {userData?.telefono && (
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <span className="text-sabu-primary">📱</span>
                <span className="truncate">{userData.telefono}</span>
              </p>
            )}
            {userData?.direccion && userData?.altura && userData?.codigo_postal && (
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-3">
                <span className="text-sabu-primary">📍</span>
                <span className="truncate">{userData.direccion} {userData.altura}</span>
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowMiCuenta(true)}
                className="flex-1 inline-flex items-center justify-center px-3 py-3 border-2 border-[#0D146B] text-sm font-semibold rounded-lg shadow-sm text-[#00BF63] bg-white active:bg-[#0D146B] active:text-white transition-all duration-200 min-h-[44px]"
              >
                <span className="mr-1.5">⚙️</span>
                <span>Mi Cuenta</span>
              </button>
              <button
                onClick={signOut}
                className="flex-1 inline-flex items-center justify-center px-3 py-3 border-2 border-red-500 text-sm font-semibold rounded-lg shadow-sm text-white bg-red-500 active:bg-red-600 active:border-red-600 transition-all duration-200 min-h-[44px]"
              >
                <span className="mr-1.5">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white border-2 border-sabu-secondary rounded-xl shadow-md flex items-center justify-center">
                <Logo size={64} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  ¡Hola, {userData?.nombre 
                    ? `${userData.nombre} ` 
                    : 'Usuario'}!
                </h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1">
                  {userData?.telefono && (
                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <span className="text-sabu-primary">📱</span>
                      <span>{userData.telefono}</span>
                    </p>
                  )}
                  {userData?.direccion && userData?.altura && userData?.codigo_postal && (
                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <span className="text-sabu-primary">📍</span>
                      <span>{userData.direccion} {userData.altura}, {userData.codigo_postal}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMiCuenta(true)}
                className="inline-flex items-center px-4 py-2.5 border-2 border-[#0D146B] text-sm font-semibold rounded-lg shadow-sm text-[#00BF63] bg-white hover:bg-[#0D146B] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D146B]"
              >
                <span className="mr-2">⚙️</span>
                Mi Cuenta
              </button>
              <button
                onClick={signOut}
                className="inline-flex items-center px-4 py-2.5 border-2 border-red-500 text-sm font-semibold rounded-lg shadow-sm text-white bg-red-500 hover:bg-red-600 hover:border-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <span className="mr-2">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Sección compacta para Supermercados y Medios de Pago (Grid en desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Card de Supermercados - Compacta */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-1.5 bg-green-100 rounded-lg">
                    <span className="text-lg sm:text-xl">🏪</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Supermercados
                  </h3>
                </div>
                {userData?.supermercados_preferidos_usuario?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {userData.supermercados_preferidos_usuario.map((pref, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200 shadow-sm"
                      >
                        {pref.supermercados.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Sin configurar</p>
                )}
              </div>

              {/* Card de Medios de Pago - Compacta */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-1.5 bg-blue-100 rounded-lg">
                    <span className="text-lg sm:text-xl">💳</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Medios de Pago
                  </h3>
                </div>
                {userData?.medios_de_pago_x_usuario?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {userData.medios_de_pago_x_usuario.map((mp, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 shadow-sm"
                      >
                        {mp.medios_de_pago.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Sin configurar</p>
                )}
              </div>
            </div>

            {/* Carritos - Sección protagonista */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-sabu-primary/20 p-4 sm:p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <Carritos />
            </div>
          </div>
        </div>
      </main>

      {showMiCuenta && <MiCuenta onClose={() => setShowMiCuenta(false)} />}
    </div>
  )
}