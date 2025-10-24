import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithMagicLink = async (email) => {
    // Detectar si estamos en desarrollo local
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const redirectUrl = isLocal 
      ? 'http://localhost:3000/' 
      : `${window.location.origin}/`
    
    console.log('Magic Link redirect URL:', redirectUrl)
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    })
    if (error) {
      console.error('Error:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error:', error)
  }

  return {
    user,
    loading,
    signInWithMagicLink,
    signOut
  }
}
