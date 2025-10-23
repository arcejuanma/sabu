import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-2xl mr-2">💰</span>
              <h1 className="text-2xl font-bold text-gray-900">SABU</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Hola, {user?.user_metadata?.full_name || user?.email}
              </div>
              <button
                onClick={signOut}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a SABU! 🎉
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Empezá a ahorrar en tus compras del supermercado
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">Crear Lista</h3>
                <p className="text-gray-600">Agregá los productos que comprás habitualmente</p>
                <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  Nueva Lista
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">💳</div>
                <h3 className="text-xl font-semibold mb-2">Mis Tarjetas</h3>
                <p className="text-gray-600">Configurá tus medios de pago</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Agregar Tarjeta
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">Notificaciones</h3>
                <p className="text-gray-600">Recibí alertas de mejores precios</p>
                <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                  Ver Alertas
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
