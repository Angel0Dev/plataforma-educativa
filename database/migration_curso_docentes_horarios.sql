-- =====================================================
-- MIGRACIÓN: Sistema de Múltiples Docentes y Horarios por Curso
-- Permite asignar varios docentes a un curso con horarios específicos
-- =====================================================

-- 1. Crear tabla para relación muchos-a-muchos entre Cursos y Docentes
CREATE TABLE IF NOT EXISTS Curso_Docente (
    id_curso_docente SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    id_docente INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(id_curso, id_docente)
);

-- 2. Crear tabla para horarios de los cursos
CREATE TABLE IF NOT EXISTS Horarios (
    id_horario SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    id_docente INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_salon INTEGER REFERENCES Salones(id_salon) ON DELETE SET NULL,
    dia_semana VARCHAR(10) NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    turno VARCHAR(20) CHECK (turno IN ('Mañana', 'Tarde')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (hora_fin > hora_inicio)
);

-- 3. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_curso_docente_curso ON Curso_Docente(id_curso);
CREATE INDEX IF NOT EXISTS idx_curso_docente_docente ON Curso_Docente(id_docente);
CREATE INDEX IF NOT EXISTS idx_horarios_curso ON Horarios(id_curso);
CREATE INDEX IF NOT EXISTS idx_horarios_docente ON Horarios(id_docente);
CREATE INDEX IF NOT EXISTS idx_horarios_salon ON Horarios(id_salon);
CREATE INDEX IF NOT EXISTS idx_horarios_dia ON Horarios(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_turno ON Horarios(turno);

-- 4. Comentarios
COMMENT ON TABLE Curso_Docente IS 'Relación muchos-a-muchos entre Cursos y Docentes';
COMMENT ON TABLE Horarios IS 'Horarios semanales de los cursos con docentes y salones asignados';
COMMENT ON COLUMN Horarios.dia_semana IS 'Día de la semana (Lunes a Viernes)';
COMMENT ON COLUMN Horarios.turno IS 'Turno del horario (Mañana o Tarde)';

-- 5. Función para verificar que no haya conflictos de horario para un docente
CREATE OR REPLACE FUNCTION verificar_conflicto_horario_docente()
RETURNS TRIGGER AS $$
DECLARE
    conflicto_existente INTEGER;
BEGIN
    -- Verificar si el docente tiene otro horario en el mismo día y turno que se solape
    SELECT COUNT(*) INTO conflicto_existente
    FROM Horarios
    WHERE id_docente = NEW.id_docente
    AND dia_semana = NEW.dia_semana
    AND turno = NEW.turno
    AND activo = true
    AND id_horario != COALESCE(NEW.id_horario, 0)
    AND (
        (hora_inicio <= NEW.hora_inicio AND hora_fin > NEW.hora_inicio) OR
        (hora_inicio < NEW.hora_fin AND hora_fin >= NEW.hora_fin) OR
        (hora_inicio >= NEW.hora_inicio AND hora_fin <= NEW.hora_fin)
    );
    
    IF conflicto_existente > 0 THEN
        RAISE EXCEPTION 'El docente tiene un conflicto de horario en este día y turno';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para verificar conflictos de horario
DROP TRIGGER IF EXISTS trigger_verificar_conflicto_horario_docente ON Horarios;
CREATE TRIGGER trigger_verificar_conflicto_horario_docente
    BEFORE INSERT OR UPDATE ON Horarios
    FOR EACH ROW
    EXECUTE FUNCTION verificar_conflicto_horario_docente();

-- 7. Función para verificar que no haya conflictos de horario para un salón
CREATE OR REPLACE FUNCTION verificar_conflicto_horario_salon()
RETURNS TRIGGER AS $$
DECLARE
    conflicto_existente INTEGER;
BEGIN
    -- Solo verificar si se asigna un salón
    IF NEW.id_salon IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Verificar si el salón está ocupado en el mismo día, turno y horario
    SELECT COUNT(*) INTO conflicto_existente
    FROM Horarios
    WHERE id_salon = NEW.id_salon
    AND dia_semana = NEW.dia_semana
    AND turno = NEW.turno
    AND activo = true
    AND id_horario != COALESCE(NEW.id_horario, 0)
    AND (
        (hora_inicio <= NEW.hora_inicio AND hora_fin > NEW.hora_inicio) OR
        (hora_inicio < NEW.hora_fin AND hora_fin >= NEW.hora_fin) OR
        (hora_inicio >= NEW.hora_inicio AND hora_fin <= NEW.hora_fin)
    );
    
    IF conflicto_existente > 0 THEN
        RAISE EXCEPTION 'El salón está ocupado en este horario';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para verificar conflictos de salón
DROP TRIGGER IF EXISTS trigger_verificar_conflicto_horario_salon ON Horarios;
CREATE TRIGGER trigger_verificar_conflicto_horario_salon
    BEFORE INSERT OR UPDATE ON Horarios
    FOR EACH ROW
    EXECUTE FUNCTION verificar_conflicto_horario_salon();

