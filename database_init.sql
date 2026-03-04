-- Script de Inicialización de Supabase para DigiBrain PYME App

-- 1. ENUMS
CREATE TYPE estado_producto AS ENUM ('disponible', 'vendido', 'reservado');
CREATE TYPE tipo_transaccion AS ENUM ('venta', 'compra', 'gasto', 'transferencia');
CREATE TYPE moneda_tipo AS ENUM ('ARS', 'USD');

-- 2. TABLAS

-- Centros de Costos
CREATE TABLE IF NOT EXISTS centros_de_costos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES auth.users(id), -- Dueño de la caja
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (Extendemos auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT,
    email TEXT UNIQUE NOT NULL,
    centro_de_costos_id UUID REFERENCES centros_de_costos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#e2e8f0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    precio_ars NUMERIC,
    precio_usd NUMERIC,
    stock INTEGER DEFAULT 1,
    estado estado_producto DEFAULT 'disponible',
    fecha_carga TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT precio_requerido CHECK (precio_ars IS NOT NULL OR precio_usd IS NOT NULL)
);

-- Productos_Etiquetas (Many-to-Many)
CREATE TABLE IF NOT EXISTS productos_etiquetas (
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    etiqueta_id UUID REFERENCES etiquetas(id) ON DELETE CASCADE,
    PRIMARY KEY (producto_id, etiqueta_id)
);

-- Fotos de Productos
CREATE TABLE IF NOT EXISTS producto_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo tipo_transaccion NOT NULL,
    monto NUMERIC NOT NULL CHECK (monto >= 0),
    moneda moneda_tipo NOT NULL,
    centro_de_costos_id UUID REFERENCES centros_de_costos(id) NOT NULL,
    centro_destino_id UUID REFERENCES centros_de_costos(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    cotizacion_usd NUMERIC, -- Saved exchange rate to USD at the moment of the transaction
    descripcion TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    registrada_por UUID REFERENCES auth.users(id) NOT NULL
);

-- Configuración
CREATE TABLE IF NOT EXISTS configuracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave TEXT UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SEGURIDAD (RLS - ROW LEVEL SECURITY)

-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_de_costos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Lectura para el catálogo)
CREATE POLICY "Public read acceso a configuracion" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Public read acceso a categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Public read acceso a etiquetas" ON etiquetas FOR SELECT USING (true);
CREATE POLICY "Public read acceso a productos disponibles" ON productos FOR SELECT USING (estado = 'disponible');
CREATE POLICY "Public read acceso a fotos de productos disponibles" ON producto_fotos FOR SELECT USING (
    EXISTS (SELECT 1 FROM productos WHERE productos.id = producto_fotos.producto_id AND productos.estado = 'disponible')
);
CREATE POLICY "Public read acceso a etiquetas de productos disponibles" ON productos_etiquetas FOR SELECT USING (
    EXISTS (SELECT 1 FROM productos WHERE productos.id = productos_etiquetas.producto_id AND productos.estado = 'disponible')
);

-- Políticas Autenticadas (CRUD total para administradores/socios)
CREATE POLICY "Auth all acceso a centros_de_costos" ON centros_de_costos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a perfiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a categorias" ON categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a etiquetas" ON etiquetas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a productos" ON productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a productos_etiquetas" ON productos_etiquetas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a producto_fotos" ON producto_fotos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a transacciones" ON transacciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth all acceso a configuracion" ON configuracion FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. TRIGGERS

-- Trigger para crear profile automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para actualizar stock y cambiar estado cuando se asocia a una transaccion
CREATE OR REPLACE FUNCTION public.handle_transaccion_producto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.producto_id IS NOT NULL THEN
    IF NEW.tipo = 'venta' THEN
      UPDATE public.productos 
      SET stock = GREATEST(stock - 1, 0) 
      WHERE id = NEW.producto_id;
      
      UPDATE public.productos 
      SET estado = 'vendido' 
      WHERE id = NEW.producto_id AND stock = 0;
    ELSIF NEW.tipo = 'compra' THEN
      UPDATE public.productos 
      SET stock = stock + 1, estado = 'disponible' 
      WHERE id = NEW.producto_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_venta_registrada ON transacciones;
CREATE TRIGGER on_transaccion_producto
  AFTER INSERT ON transacciones
  FOR EACH ROW EXECUTE PROCEDURE public.handle_transaccion_producto();

-- 5. DATOS INICIALES (Configuración básica)
INSERT INTO configuracion (clave, valor) VALUES 
('nombre_tienda', '"DigiBrain"'),
('tipo_cambio_preferido', '"blue"'),
('contacto_whatsapp', '"+5491112345678"'),
('contacto_instagram', '"@digibrain"')
ON CONFLICT (clave) DO NOTHING;
