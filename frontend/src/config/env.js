// Configuración de variables de entorno para desarrollo local
// Copia este archivo y renómbralo a .env.local en la raíz del frontend

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'
  }
}

// Para desarrollo local, puedes hardcodear temporalmente aquí:
// export const config = {
//   supabase: {
//     url: 'https://tu-proyecto.supabase.co',
//     anonKey: 'tu_anon_key_aqui'
//   }
// }
