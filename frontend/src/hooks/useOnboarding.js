import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('No user found, setting needsOnboarding to false')
        setNeedsOnboarding(false)
        setLoading(false)
        return
      }

      console.log('Checking onboarding status for user:', user.id)

      // Verificar si el usuario tiene datos básicos
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nombre, apellido, telefono')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log('Error fetching user data:', error)
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }

      if (!usuario) {
        console.log('User not found in usuarios table')
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }

      if (!usuario.nombre || !usuario.apellido || !usuario.telefono) {
        console.log('User missing basic data')
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }

      // Verificar si tiene supermercados preferidos
      console.log('Verificando supermercados preferidos para usuario:', user.id)
      const { data: supermercados, error: superError } = await supabase
        .from('supermercados_preferidos_usuario')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('activo', true)

      console.log('Supermercados preferidos encontrados:', supermercados)
      console.log('Error en consulta:', superError)

      if (superError) {
        console.log('Error fetching supermercados:', superError)
        setNeedsOnboarding(true)
      } else if (!supermercados || supermercados.length === 0) {
        console.log('Usuario necesita onboarding - sin supermercados preferidos')
        setNeedsOnboarding(true)
      } else {
        console.log('Usuario completó onboarding - tiene supermercados preferidos')
        setNeedsOnboarding(false)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setNeedsOnboarding(true)
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

      // Los supermercados ya vienen con IDs reales desde el frontend
      console.log('Supermercados seleccionados (IDs reales):', userData.supermercados)

      // Crear supermercados preferidos directamente con los IDs
      const supermercadosData = userData.supermercados.map(supermercadoId => ({
        usuario_id: user.id,
        supermercado_id: supermercadoId,
        activo: true
      }))

      console.log('Datos a insertar:', supermercadosData)

      const { data: insertedData, error: superError } = await supabase
        .from('supermercados_preferidos_usuario')
        .insert(supermercadosData)
        .select()

      if (superError) {
        console.error('Error insertando supermercados preferidos:', superError)
        throw superError
      }

      console.log('Supermercados preferidos insertados:', insertedData)

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
