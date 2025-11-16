-- =====================================================
-- MIGRACIÓN: Agregar Turno a Cursos
-- Permite asignar turno (Mañana/Tarde) a los cursos
-- =====================================================

-- 1. Agregar columna 'turno' a la tabla Cursos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cursos' AND column_name = 'turno'
    ) THEN
        ALTER TABLE Cursos ADD COLUMN turno VARCHAR(20) CHECK (turno IN ('Mañana', 'Tarde'));
        COMMENT ON COLUMN Cursos.turno IS 'Turno del curso (Mañana o Tarde)';
    END IF;
END $$;

-- 2. Crear índice para mejorar búsquedas por turno
CREATE INDEX IF NOT EXISTS idx_cursos_turno ON Cursos(turno);

-- 3. Verificar que la columna fue agregada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND column_name = 'turno';

