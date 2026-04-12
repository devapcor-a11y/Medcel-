-- Script de Inicialización de Supabase para Medcel (E-Commerce + Finanzas Dashboard)

-- 1. ENUMS
-- Estados mixtos para soportar legacy dashboard y e-commerce moderno
CREATE TYPE estado_producto AS ENUM ('disponible', 'vendido', 'reservado', 'borrador', 'publicado', 'archivado');
CREATE TYPE estado_orden AS ENUM ('pendiente', 'pagada', 'enviada', 'entregada', 'cancelada');
CREATE TYPE tipo_transaccion AS ENUM ('venta', 'compra', 'gasto', 'transferencia');
CREATE TYPE moneda_tipo AS ENUM ('ARS', 'USD');
CREATE TYPE sexo_producto AS ENUM ('femenino', 'masculino', 'unisex');

-- 2. TABLAS

-- Centros de Costos (Legacy Dashboard)
CREATE TABLE IF NOT EXISTS centros_de_costos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (Usuarios del sistema y clientes)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT,
    apellido TEXT,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    centro_de_costos_id UUID REFERENCES centros_de_costos(id),
    rol TEXT DEFAULT 'cliente', -- 'admin' o 'cliente'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categorías (Legacy + Nuevo)
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Etiquetas (Legacy)
CREATE TABLE IF NOT EXISTS etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#e2e8f0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Productos (Soporta Legacy Dashboard y E-commerce)
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE,
    descripcion TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    precio NUMERIC DEFAULT 0, -- Opcional para nuevo modelo
    precio_ars NUMERIC,       -- Legacy Dashboard
    precio_usd NUMERIC,       -- Legacy Dashboard
    stock INTEGER DEFAULT 1,  -- Legacy Stock control
    sexo sexo_producto DEFAULT 'unisex', -- NEW
    estado estado_producto DEFAULT 'disponible',
    destacado BOOLEAN DEFAULT false,
    fecha_carga TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Productos_Etiquetas (Legacy Muchos-a-Muchos)
CREATE TABLE IF NOT EXISTS productos_etiquetas (
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    etiqueta_id UUID REFERENCES etiquetas(id) ON DELETE CASCADE,
    PRIMARY KEY (producto_id, etiqueta_id)
);

-- Variantes del Producto (Talles, Colores y Stock) - E-COMMERCE MEDCEL
-- Esto permite que un mismo "Ambo" tenga distintos talles (XS, S) y cada uno un stock independiente
CREATE TABLE IF NOT EXISTS producto_variantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    talle TEXT NOT NULL,
    color TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(producto_id, talle, color)
);

-- Fotos de Productos
CREATE TABLE IF NOT EXISTS producto_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transacciones (Finanzas y Gastos - Legacy Dashboard)
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo tipo_transaccion NOT NULL,
    monto NUMERIC NOT NULL CHECK (monto >= 0),
    moneda moneda_tipo NOT NULL,
    centro_de_costos_id UUID REFERENCES centros_de_costos(id) NOT NULL,
    centro_destino_id UUID REFERENCES centros_de_costos(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    producto_variante_id UUID REFERENCES producto_variantes(id) ON DELETE SET NULL, -- NEW
    cotizacion_usd NUMERIC,
    descripcion TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    registrada_por UUID REFERENCES auth.users(id) NOT NULL
);

-- Órdenes (Compras E-Commerce Moderno)
CREATE TABLE IF NOT EXISTS ordenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total NUMERIC NOT NULL CHECK (total >= 0),
    estado estado_orden DEFAULT 'pendiente',
    direccion_envio JSONB,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Items de la Orden
CREATE TABLE IF NOT EXISTS orden_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_variante_id UUID REFERENCES producto_variantes(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC NOT NULL CHECK (precio_unitario >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configuración del Sistema
CREATE TABLE IF NOT EXISTS configuracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave TEXT UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SEGURIDAD (RLS) Simplificado
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_de_costos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_variantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceso_total" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_centros" ON centros_de_costos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_transacciones" ON transacciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_cate" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_vars" ON producto_variantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_fotos" ON producto_fotos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_config" ON configuracion FOR ALL USING (true) WITH CHECK (true);

-- 4. TRIGGERS

-- Crear profile automáticamente al registrar un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger Legacy: Actualizar stock de 'productos' y 'producto_variantes' si aplica
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

DROP TRIGGER IF EXISTS on_transaccion_producto ON transacciones;
CREATE TRIGGER on_transaccion_producto
  AFTER INSERT ON transacciones
  FOR EACH ROW EXECUTE PROCEDURE public.handle_transaccion_producto();

-- 5. DATOS INICIALES (Configuración básica)
INSERT INTO configuracion (clave, valor) VALUES 
('nombre_tienda', '"Medcel"'),
('tipo_cambio_preferido', '"blue"'),
('contacto_whatsapp', '"+5493735565171"'),
('contacto_instagram', '"@ambosmedcel"')
ON CONFLICT (clave) DO NOTHING;

-- Crear categorías iniciales
INSERT INTO categorias (nombre, slug, descripcion) VALUES
('Ambos', 'ambos', 'Ambos médicos completos de alta calidad.'),
('Cofias', 'cofias', 'Cofias personalizadas y de diseño.')
ON CONFLICT (slug) DO NOTHING;
