-- Row Level Security (RLS) Policies MÍNIMAS para SABU
-- Solo para las tablas esenciales que ya existen
-- Ejecutar DESPUÉS de crear las tablas principales

-- 1. Habilitar RLS solo en tablas esenciales
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados_preferidos_usuario ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para USUARIOS
CREATE POLICY "Users can view own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- 3. Políticas para SUPERMERCADOS_PREFERIDOS_USUARIO
CREATE POLICY "Users can view own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- Mensaje de confirmación
SELECT 'RLS Policies MÍNIMAS aplicadas exitosamente!' as status;
