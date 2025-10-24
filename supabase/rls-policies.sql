-- Row Level Security (RLS) Policies para SABU
-- Ejecutar en Supabase SQL Editor después de crear las tablas

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos_x_medio_de_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios_de_pago_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_supermercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_bancarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_super_unitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_super_cantidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos_x_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_x_carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_sustitucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_similares ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugerencias_sustitucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermercados_preferidos_usuario ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para USUARIOS
-- Los usuarios pueden ver y modificar solo sus propios datos
CREATE POLICY "Users can view own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- 3. Políticas para MEDIOS DE PAGO (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view payment methods" ON medios_de_pago
  FOR SELECT USING (true);

-- 4. Políticas para SEGMENTOS (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view segments" ON segmentos
  FOR SELECT USING (true);

-- 5. Políticas para SEGMENTOS_X_MEDIO_DE_PAGO (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view segment payment methods" ON segmentos_x_medio_de_pago
  FOR SELECT USING (true);

-- 6. Políticas para MEDIOS_DE_PAGO_X_USUARIO
CREATE POLICY "Users can view own payment methods" ON medios_de_pago_x_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own payment methods" ON medios_de_pago_x_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own payment methods" ON medios_de_pago_x_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own payment methods" ON medios_de_pago_x_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- 7. Políticas para CATEGORIAS_PRODUCTOS (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view product categories" ON categorias_productos
  FOR SELECT USING (true);

-- 8. Políticas para PRODUCTOS (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view products" ON productos
  FOR SELECT USING (true);

-- 9. Políticas para SUPERMERCADOS (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view supermarkets" ON supermercados
  FOR SELECT USING (true);

-- 10. Políticas para PRODUCTOS_X_SUPERMERCADO (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view product supermarket prices" ON productos_x_supermercado
  FOR SELECT USING (true);

-- 11. Políticas para BENEFICIOS_BANCARIOS (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view banking benefits" ON beneficios_bancarios
  FOR SELECT USING (true);

-- 12. Políticas para BENEFICIOS_SUPER_UNITARIOS (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view supermarket unit benefits" ON beneficios_super_unitarios
  FOR SELECT USING (true);

-- 13. Políticas para BENEFICIOS_SUPER_CANTIDAD (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view supermarket quantity benefits" ON beneficios_super_cantidad
  FOR SELECT USING (true);

-- 14. Políticas para CARRITOS_X_USUARIO
CREATE POLICY "Users can view own carts" ON carritos_x_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own carts" ON carritos_x_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own carts" ON carritos_x_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own carts" ON carritos_x_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- 15. Políticas para PRODUCTOS_X_CARRITO
CREATE POLICY "Users can view own cart products" ON productos_x_carrito
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cart products" ON productos_x_carrito
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart products" ON productos_x_carrito
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart products" ON productos_x_carrito
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM carritos_x_usuario 
      WHERE carritos_x_usuario.id = productos_x_carrito.carrito_id 
      AND carritos_x_usuario.usuario_id = auth.uid()
    )
  );

-- 16. Políticas para CRITERIOS_SUSTITUCION
CREATE POLICY "Users can view own substitution criteria" ON criterios_sustitucion
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own substitution criteria" ON criterios_sustitucion
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own substitution criteria" ON criterios_sustitucion
  FOR UPDATE USING (auth.uid() = usuario_id);

-- 17. Políticas para PRODUCTOS_SIMILARES (tabla maestra - todos pueden leer)
CREATE POLICY "Anyone can view similar products" ON productos_similares
  FOR SELECT USING (true);

-- 18. Políticas para SUGERENCIAS_SUSTITUCION
CREATE POLICY "Users can view own substitution suggestions" ON sugerencias_sustitucion
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own substitution suggestions" ON sugerencias_sustitucion
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);


-- 20. Políticas para NOTIFICACIONES
CREATE POLICY "Users can view own notifications" ON notificaciones
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can update own notifications" ON notificaciones
  FOR UPDATE USING (auth.uid() = usuario_id);

-- 21. Políticas para HISTORIAL_COMPRAS
CREATE POLICY "Users can view own purchase history" ON historial_compras
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own purchase history" ON historial_compras
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- 22. Políticas para CUPOS_USUARIO
CREATE POLICY "Users can view own monthly quotas" ON cupos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own monthly quotas" ON cupos_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own monthly quotas" ON cupos_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

-- 23. Políticas para SUPERMERCADOS_PREFERIDOS_USUARIO
CREATE POLICY "Users can view own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own preferred supermarkets" ON supermercados_preferidos_usuario
  FOR DELETE USING (auth.uid() = usuario_id);
