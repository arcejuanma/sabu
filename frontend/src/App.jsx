import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useOnboarding } from './hooks/useOnboarding'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'

function App() {
  const { user, loading: authLoading } = useAuth()
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding()

  // Mostrar loading mientras se cargan los datos
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando SABU...</p>
        </div>
      </div>
    )
  }

  // Función para determinar qué componente mostrar
  const getComponentForRoute = (path) => {
    // Si no hay usuario, mostrar Login
    if (!user) {
      return path === '/' ? <Login /> : <Navigate to="/" replace />
    }

    // Si hay usuario pero necesita onboarding
    if (needsOnboarding) {
      return path === '/onboarding' ? <Onboarding /> : <Navigate to="/onboarding" replace />
    }

    // Si el usuario está completo, mostrar Dashboard o redirigir
    if (path === '/dashboard') {
      return <Dashboard />
    }
    
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={getComponentForRoute('/')} />
        <Route path="/dashboard" element={getComponentForRoute('/dashboard')} />
        <Route path="/onboarding" element={getComponentForRoute('/onboarding')} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App