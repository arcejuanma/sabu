import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setNeedsOnboarding(false)
        setLoading(false)
        return
      }

      // Verificar si el usuario tiene datos básicos
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nombre, apellido, telefono')
        .eq('id', user.id)
        .single()

      if (error || !usuario) {
        // Usuario no existe en la tabla usuarios
        setNeedsOnboarding(true)
      } else if (!usuario.nombre || !usuario.apellido || !usuario.telefono) {
        // Usuario existe pero le faltan datos básicos
        setNeedsOnboarding(true)
      } else {
        // Verificar si tiene supermercados preferidos
        const { data: supermercados, error: superError } = await supabase
          .from('supermercados_preferidos_usuario')
          .select('id')
          .eq('usuario_id', user.id)
          .eq('activo', true)

        if (superError || !supermercados || supermercados.length === 0) {
          setNeedsOnboarding(true)
        } else {
          setNeedsOnboarding(false)
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setNeedsOnboarding(false)
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async (userData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user found')

      // Crear o actualizar usuario
      const { error: userError } = await supabase
        .from('usuarios')
        .upsert({
          id: user.id,
          nombre: userData.nombre,
          apellido: userData.apellido,
          telefono: userData.telefono,
          email: user.email
        })

      if (userError) throw userError

      // Crear supermercados preferidos
      const supermercadosData = userData.supermercados.map(supermercadoId => ({
        usuario_id: user.id,
        supermercado_id: supermercadoId,
        activo: true
      }))

      const { error: superError } = await supabase
        .from('supermercados_preferidos_usuario')
        .insert(supermercadosData)

      if (superError) throw superError

      // Marcar onboarding como completado y recargar estado
      setNeedsOnboarding(false)
      await checkOnboardingStatus()
      return true

    } catch (error) {
      console.error('Error completing onboarding:', error)
      throw error
    }
  }

  return {
    needsOnboarding,
    loading,
    completeOnboarding
  }
}
