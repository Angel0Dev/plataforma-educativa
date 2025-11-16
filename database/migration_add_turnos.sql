-- =====================================================
-- MIGRACIÓN: Sistema de Turnos (Mañana/Tarde)
-- Agrega campo turno a Salones y Usuarios
-- =====================================================

-- 1. Agregar columna turno a Salones
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salones' AND column_name = 'turno'
    ) THEN
        ALTER TABLE Salones ADD COLUMN turno VARCHAR(10) CHECK (turno IN ('Mañana', 'Tarde'));
    END IF;
END $$;

-- 2. Agregar columna turno a Usuarios
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'turno'
    ) THEN
        ALTER TABLE Usuarios ADD COLUMN turno VARCHAR(10) CHECK (turno IN ('Mañana', 'Tarde'));
    END IF;
END $$;

-- 3. Crear función para sincronizar turno de estudiante a padres
CREATE OR REPLACE FUNCTION sincronizar_turno_padres()
RETURNS TRIGGER AS $$
DECLARE
    padre_record RECORD;
BEGIN
    -- Si el usuario es un estudiante y se le asigna un turno
    IF NEW.rol = 'Estudiante' AND NEW.turno IS NOT NULL THEN
        -- Actualizar el turno de todos los padres relacionados
        FOR padre_record IN 
            SELECT id_padre 
            FROM Relacion_Familiar 
            WHERE id_estudiante = NEW.id_usuario AND activo = true
        LOOP
            UPDATE Usuarios 
            SET turno = NEW.turno 
            WHERE id_usuario = padre_record.id_padre AND rol = 'Padre';
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para sincronizar turno automáticamente
DROP TRIGGER IF EXISTS trigger_sincronizar_turno_padres ON Usuarios;
CREATE TRIGGER trigger_sincronizar_turno_padres
    AFTER UPDATE OF turno ON Usuarios
    FOR EACH ROW
    WHEN (NEW.rol = 'Estudiante' AND NEW.turno IS DISTINCT FROM OLD.turno)
    EXECUTE FUNCTION sincronizar_turno_padres();

-- 5. Crear función para asignar turno a padres cuando se crea relación familiar
CREATE OR REPLACE FUNCTION asignar_turno_padre_al_crear_relacion()
RETURNS TRIGGER AS $$
DECLARE
    turno_estudiante VARCHAR(10);
BEGIN
    -- Obtener el turno del estudiante
    SELECT turno INTO turno_estudiante
    FROM Usuarios
    WHERE id_usuario = NEW.id_estudiante;
    
    -- Si el estudiante tiene turno, asignarlo al padre
    IF turno_estudiante IS NOT NULL THEN
        UPDATE Usuarios 
        SET turno = turno_estudiante 
        WHERE id_usuario = NEW.id_padre AND rol = 'Padre';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para asignar turno al crear relación familiar
DROP TRIGGER IF EXISTS trigger_asignar_turno_padre ON Relacion_Familiar;
CREATE TRIGGER trigger_asignar_turno_padre
    AFTER INSERT ON Relacion_Familiar
    FOR EACH ROW
    EXECUTE FUNCTION asignar_turno_padre_al_crear_relacion();

-- 7. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_salones_turno ON Salones(turno);
CREATE INDEX IF NOT EXISTS idx_usuarios_turno ON Usuarios(turno);

-- 8. Comentarios
COMMENT ON COLUMN Salones.turno IS 'Turno del salón: Mañana o Tarde';
COMMENT ON COLUMN Usuarios.turno IS 'Turno del usuario: Mañana o Tarde (se sincroniza automáticamente entre estudiantes y padres)';

