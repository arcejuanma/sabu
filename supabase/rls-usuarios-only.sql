-- RLS Policies SOLO para tabla USUARIOS
-- Ejecutar este script primero para resolver el error 403

-- 1. Habilitar RLS en usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para USUARIOS
CREATE POLICY "Users can view own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Mensaje de confirmación
SELECT 'RLS para USUARIOS aplicado exitosamente!' as status;
