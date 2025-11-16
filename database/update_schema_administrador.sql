-- =====================================================
-- SCRIPT DE ACTUALIZACIÓN PARA PERMITIR ROL ADMINISTRADOR
-- Ejecutar este script en la base de datos existente
-- =====================================================

-- Actualizar la restricción CHECK para permitir el rol 'Administrador'
ALTER TABLE Usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE Usuarios 
ADD CONSTRAINT usuarios_rol_check 
CHECK (rol IN ('Docente', 'Estudiante', 'Padre', 'Administrador'));

-- Verificar que la actualización fue exitosa
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Usuarios' AND column_name = 'rol';

-- Verificar la restricción
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass 
AND conname = 'usuarios_rol_check';

