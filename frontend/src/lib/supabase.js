import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

export const supabase = createClient(config.supabase.url, config.supabase.anonKey)
