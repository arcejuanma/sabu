import { useAuth } from './hooks/useAuth'
import { useOnboarding } from './hooks/useOnboarding'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'

function App() {
  const { user, loading: authLoading } = useAuth()
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding()

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

  if (!user) {
    return <Login />
  }

  if (needsOnboarding) {
    return <Onboarding />
  }

  return <Dashboard />
}

export default App