-- =====================================================
-- MIGRACIÓN: Sistema de Salones
-- Agrega tabla de Salones y modifica Matricula para incluir salón
-- =====================================================

-- 1. Crear tabla de Salones
CREATE TABLE IF NOT EXISTS Salones (
    id_salon SERIAL PRIMARY KEY,
    nombre_salon VARCHAR(50) NOT NULL,
    descripcion TEXT,
    capacidad_maxima INTEGER DEFAULT 40 NOT NULL CHECK (capacidad_maxima > 0),
    id_docente_titular INTEGER REFERENCES Usuarios(id_usuario) ON DELETE SET NULL,
    grado VARCHAR(20), -- Ej: "1ro", "2do", "3ro", etc.
    seccion VARCHAR(10), -- Ej: "A", "B", "C", etc.
    anio_academico VARCHAR(20), -- Ej: "2024-2025"
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Agregar columna id_salon a Matricula si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matricula' AND column_name = 'id_salon'
    ) THEN
        ALTER TABLE Matricula ADD COLUMN id_salon INTEGER REFERENCES Salones(id_salon) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Crear función para verificar capacidad del salón
CREATE OR REPLACE FUNCTION verificar_capacidad_salon()
RETURNS TRIGGER AS $$
DECLARE
    estudiantes_actuales INTEGER;
    capacidad_max INTEGER;
BEGIN
    -- Obtener capacidad máxima del salón
    SELECT capacidad_maxima INTO capacidad_max
    FROM Salones
    WHERE id_salon = NEW.id_salon AND activo = true;
    
    -- Contar estudiantes activos en el salón
    SELECT COUNT(*) INTO estudiantes_actuales
    FROM Matricula
    WHERE id_salon = NEW.id_salon 
    AND estado = 'Activo'
    AND id_estudiante != NEW.id_estudiante;
    
    -- Verificar si excede la capacidad
    IF estudiantes_actuales >= capacidad_max THEN
        RAISE EXCEPTION 'El salón ha alcanzado su capacidad máxima de % estudiantes', capacidad_max;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para verificar capacidad antes de insertar
DROP TRIGGER IF EXISTS trigger_verificar_capacidad_salon ON Matricula;
CREATE TRIGGER trigger_verificar_capacidad_salon
    BEFORE INSERT OR UPDATE ON Matricula
    FOR EACH ROW
    WHEN (NEW.id_salon IS NOT NULL)
    EXECUTE FUNCTION verificar_capacidad_salon();

-- 5. Crear función para obtener contador de estudiantes por salón
CREATE OR REPLACE FUNCTION obtener_estudiantes_salon(p_id_salon INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COUNT(*) INTO total
    FROM Matricula
    WHERE id_salon = p_id_salon AND estado = 'Activo';
    
    RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql;

-- 6. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_salones_docente ON Salones(id_docente_titular);
CREATE INDEX IF NOT EXISTS idx_salones_activo ON Salones(activo);
CREATE INDEX IF NOT EXISTS idx_matricula_salon ON Matricula(id_salon);

-- 7. Comentarios
COMMENT ON TABLE Salones IS 'Salones de clase con capacidad máxima de estudiantes';
COMMENT ON COLUMN Salones.capacidad_maxima IS 'Capacidad máxima de estudiantes (por defecto 40)';
COMMENT ON COLUMN Matricula.id_salon IS 'Salón al que pertenece el estudiante';

