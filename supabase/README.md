# Supabase Setup

## 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta
3. New Project → Elige nombre y región
4. Espera a que se cree (2-3 minutos)

## 2. Obtener variables de entorno
1. Ve a Settings → API
2. Copia:
   - Project URL
   - anon public key
   - service_role key

## 3. Configurar variables
### Frontend (.env)
```env
VITE_SUPABASE_URL=tu_project_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_API_URL=http://localhost:4000
```

### Backend (.env)
```env
SUPABASE_URL=tu_project_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=4000
```

## 4. Crear tablas
1. Ve a SQL Editor en Supabase
2. Ejecuta las migraciones
3. Verifica en Table Editor

## 5. Configurar RLS
- Row Level Security habilitado
- Políticas de seguridad configuradas
- Usuarios solo ven sus datos
