-- =====================================================
-- MIGRACIÓN: Agregar campos DNI y contacto a Usuarios
-- Ejecutar este script en la base de datos existente
-- =====================================================

-- Agregar columna DNI (único, nullable para usuarios existentes)
ALTER TABLE Usuarios 
ADD COLUMN IF NOT EXISTS dni VARCHAR(20);

-- Crear índice único para DNI
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_dni_unique ON Usuarios(dni) WHERE dni IS NOT NULL;

-- Agregar columna teléfono
ALTER TABLE Usuarios 
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- Agregar columna dirección
ALTER TABLE Usuarios 
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Crear índice para DNI
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON Usuarios(dni) WHERE dni IS NOT NULL;

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Usuarios' 
AND column_name IN ('dni', 'telefono', 'direccion')
ORDER BY column_name;

-- Comentarios en las columnas
COMMENT ON COLUMN Usuarios.dni IS 'Documento Nacional de Identidad (requerido para Padres)';
COMMENT ON COLUMN Usuarios.telefono IS 'Teléfono de contacto';
COMMENT ON COLUMN Usuarios.direccion IS 'Dirección de contacto';

