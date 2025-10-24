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
        console.log('Verificando supermercados preferidos para usuario:', user.id)
        const { data: supermercados, error: superError } = await supabase
          .from('supermercados_preferidos_usuario')
          .select('id')
          .eq('usuario_id', user.id)
          .eq('activo', true)

        console.log('Supermercados preferidos encontrados:', supermercados)
        console.log('Error en consulta:', superError)

        if (superError || !supermercados || supermercados.length === 0) {
          console.log('Usuario necesita onboarding - sin supermercados preferidos')
          setNeedsOnboarding(true)
        } else {
          console.log('Usuario completó onboarding - tiene supermercados preferidos')
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

      // Obtener IDs reales de los supermercados
      console.log('Buscando supermercados:', userData.supermercados)
      const { data: supermercados, error: supermercadosError } = await supabase
        .from('supermercados')
        .select('id, nombre')
        .in('nombre', userData.supermercados)

      if (supermercadosError) {
        console.error('Error obteniendo supermercados:', supermercadosError)
        throw supermercadosError
      }

      console.log('Supermercados encontrados:', supermercados)

      // Crear supermercados preferidos con IDs reales
      const supermercadosData = supermercados.map(supermercado => ({
        usuario_id: user.id,
        supermercado_id: supermercado.id,
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
