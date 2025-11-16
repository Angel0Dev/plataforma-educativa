-- =====================================================
-- SCRIPT COMPLETO DE BASE DE DATOS
-- Plataforma Educativa - PostgreSQL
-- Incluye todas las tablas, migraciones, funciones y triggers
-- =====================================================

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE plataforma_educativa;
-- \c plataforma_educativa;

-- =====================================================
-- 1. MÓDULO DE USUARIOS Y ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    codigo_orcid VARCHAR(20),
    dni VARCHAR(20) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    rol VARCHAR(15) NOT NULL CHECK (rol IN ('Docente', 'Estudiante', 'Padre', 'Administrador')),
    turno VARCHAR(10) CHECK (turno IN ('Mañana', 'Tarde')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON Usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON Usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON Usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON Usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_turno ON Usuarios(turno);
CREATE INDEX IF NOT EXISTS idx_usuarios_inactivos_limpieza ON Usuarios(activo, fecha_actualizacion) WHERE activo = false;

-- =====================================================
-- 2. MÓDULO ACADÉMICO Y DE TAREAS
-- =====================================================

CREATE TABLE IF NOT EXISTS Cursos (
    id_curso SERIAL PRIMARY KEY,
    nombre_curso VARCHAR(100) NOT NULL,
    descripcion TEXT,
    turno VARCHAR(20) CHECK (turno IN ('Mañana', 'Tarde')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Matricula (
    id_matricula SERIAL PRIMARY KEY,
    id_estudiante INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    id_salon INTEGER REFERENCES Salones(id_salon) ON DELETE SET NULL,
    fecha_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
    UNIQUE(id_estudiante, id_curso)
);

CREATE TABLE IF NOT EXISTS Tareas (
    id_tarea SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntos_maximos NUMERIC(5,2) DEFAULT 100.00,
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Entregas (
    id_entrega SERIAL PRIMARY KEY,
    id_tarea INTEGER NOT NULL REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
    id_estudiante INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion NUMERIC(4, 2) CHECK (calificacion >= 0 AND calificacion <= 20),
    feedback_docente TEXT,
    archivo_adjunto VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'Entregado' CHECK (estado IN ('Entregado', 'Calificado', 'Rechazado')),
    UNIQUE(id_tarea, id_estudiante)
);

-- Índices para el módulo académico
CREATE INDEX IF NOT EXISTS idx_cursos_turno ON Cursos(turno);
CREATE INDEX IF NOT EXISTS idx_matricula_estudiante ON Matricula(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_matricula_curso ON Matricula(id_curso);
CREATE INDEX IF NOT EXISTS idx_matricula_salon ON Matricula(id_salon);
CREATE INDEX IF NOT EXISTS idx_tareas_curso ON Tareas(id_curso);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_limite ON Tareas(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_entregas_tarea ON Entregas(id_tarea);
CREATE INDEX IF NOT EXISTS idx_entregas_estudiante ON Entregas(id_estudiante);

-- =====================================================
-- 3. MÓDULO DE SALONES
-- =====================================================

CREATE TABLE IF NOT EXISTS Salones (
    id_salon SERIAL PRIMARY KEY,
    nombre_salon VARCHAR(50) NOT NULL,
    descripcion TEXT,
    capacidad_maxima INTEGER DEFAULT 40 NOT NULL CHECK (capacidad_maxima > 0),
    id_docente_titular INTEGER REFERENCES Usuarios(id_usuario) ON DELETE SET NULL,
    grado VARCHAR(20),
    seccion VARCHAR(10),
    anio_academico VARCHAR(20),
    turno VARCHAR(10) CHECK (turno IN ('Mañana', 'Tarde')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para Salones
CREATE INDEX IF NOT EXISTS idx_salones_docente ON Salones(id_docente_titular);
CREATE INDEX IF NOT EXISTS idx_salones_activo ON Salones(activo);
CREATE INDEX IF NOT EXISTS idx_salones_turno ON Salones(turno);

-- =====================================================
-- 4. MÓDULO DE DOCENTES Y HORARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS Curso_Docente (
    id_curso_docente SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    id_docente INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(id_curso, id_docente)
);

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

-- Índices para Docentes y Horarios
CREATE INDEX IF NOT EXISTS idx_curso_docente_curso ON Curso_Docente(id_curso);
CREATE INDEX IF NOT EXISTS idx_curso_docente_docente ON Curso_Docente(id_docente);
CREATE INDEX IF NOT EXISTS idx_horarios_curso ON Horarios(id_curso);
CREATE INDEX IF NOT EXISTS idx_horarios_docente ON Horarios(id_docente);
CREATE INDEX IF NOT EXISTS idx_horarios_salon ON Horarios(id_salon);
CREATE INDEX IF NOT EXISTS idx_horarios_dia ON Horarios(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_turno ON Horarios(turno);

-- =====================================================
-- 5. MÓDULO DE CONTENIDOS
-- =====================================================

CREATE TABLE IF NOT EXISTS Contenidos (
    id_contenido SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Documento', 'Video', 'Enlace', 'Presentacion', 'Imagen')),
    ruta_archivo VARCHAR(255),
    url_externa VARCHAR(500),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orden_visualizacion INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para contenidos
CREATE INDEX IF NOT EXISTS idx_contenidos_curso ON Contenidos(id_curso);
CREATE INDEX IF NOT EXISTS idx_contenidos_tipo ON Contenidos(tipo);
CREATE INDEX IF NOT EXISTS idx_contenidos_activo ON Contenidos(activo);

-- =====================================================
-- 6. MÓDULO DE COMUNICACIÓN Y NOTIFICACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS Mensajes (
    id_mensaje SERIAL PRIMARY KEY,
    id_emisor INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_receptor INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    asunto VARCHAR(150) NOT NULL,
    cuerpo TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    importante BOOLEAN DEFAULT FALSE,
    archivo_adjunto VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    tipo_evento VARCHAR(50) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP,
    leida BOOLEAN DEFAULT FALSE,
    enlace VARCHAR(255),
    datos_adicionales JSONB
);

-- Índices para comunicación
CREATE INDEX IF NOT EXISTS idx_mensajes_emisor ON Mensajes(id_emisor);
CREATE INDEX IF NOT EXISTS idx_mensajes_receptor ON Mensajes(id_receptor);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON Mensajes(fecha_envio);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON Notificaciones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON Notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON Notificaciones(fecha_creacion);

-- =====================================================
-- 7. MÓDULO DE RELACIÓN FAMILIAR
-- =====================================================

CREATE TABLE IF NOT EXISTS Relacion_Familiar (
    id_padre INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_estudiante INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    relacion VARCHAR(50) DEFAULT 'Padre' CHECK (relacion IN ('Padre', 'Madre', 'Tutor', 'Representante')),
    fecha_relacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id_padre, id_estudiante),
    CHECK (id_padre != id_estudiante)
);

-- Índices para relaciones familiares
CREATE INDEX IF NOT EXISTS idx_relacion_padre ON Relacion_Familiar(id_padre);
CREATE INDEX IF NOT EXISTS idx_relacion_estudiante ON Relacion_Familiar(id_estudiante);

-- =====================================================
-- 8. TABLAS ADICIONALES
-- =====================================================

CREATE TABLE IF NOT EXISTS Sesiones_Usuario (
    id_sesion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    token_sesion VARCHAR(255) UNIQUE NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Logs_Actividad (
    id_log SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES Usuarios(id_usuario) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INTEGER,
    detalles JSONB,
    ip_address INET,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tablas adicionales
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON Sesiones_Usuario(id_usuario);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON Sesiones_Usuario(token_sesion);
CREATE INDEX IF NOT EXISTS idx_sesiones_activa ON Sesiones_Usuario(activa);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON Logs_Actividad(id_usuario);
CREATE INDEX IF NOT EXISTS idx_logs_fecha ON Logs_Actividad(fecha_accion);

-- =====================================================
-- 9. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamp de actualización
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion en Usuarios
DROP TRIGGER IF EXISTS trigger_actualizar_usuarios ON Usuarios;
CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON Usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Función para verificar capacidad del salón
CREATE OR REPLACE FUNCTION verificar_capacidad_salon()
RETURNS TRIGGER AS $$
DECLARE
    estudiantes_actuales INTEGER;
    capacidad_max INTEGER;
BEGIN
    SELECT capacidad_maxima INTO capacidad_max
    FROM Salones
    WHERE id_salon = NEW.id_salon AND activo = true;
    
    SELECT COUNT(*) INTO estudiantes_actuales
    FROM Matricula
    WHERE id_salon = NEW.id_salon 
    AND estado = 'Activo'
    AND id_estudiante != NEW.id_estudiante;
    
    IF estudiantes_actuales >= capacidad_max THEN
        RAISE EXCEPTION 'El salón ha alcanzado su capacidad máxima de % estudiantes', capacidad_max;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar capacidad antes de insertar
DROP TRIGGER IF EXISTS trigger_verificar_capacidad_salon ON Matricula;
CREATE TRIGGER trigger_verificar_capacidad_salon
    BEFORE INSERT OR UPDATE ON Matricula
    FOR EACH ROW
    WHEN (NEW.id_salon IS NOT NULL)
    EXECUTE FUNCTION verificar_capacidad_salon();

-- Función para obtener contador de estudiantes por salón
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

-- Función para sincronizar turno de estudiante a padres
CREATE OR REPLACE FUNCTION sincronizar_turno_padres()
RETURNS TRIGGER AS $$
DECLARE
    padre_record RECORD;
BEGIN
    IF NEW.rol = 'Estudiante' AND NEW.turno IS NOT NULL THEN
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

-- Trigger para sincronizar turno automáticamente
DROP TRIGGER IF EXISTS trigger_sincronizar_turno_padres ON Usuarios;
CREATE TRIGGER trigger_sincronizar_turno_padres
    AFTER UPDATE OF turno ON Usuarios
    FOR EACH ROW
    WHEN (NEW.rol = 'Estudiante' AND NEW.turno IS DISTINCT FROM OLD.turno)
    EXECUTE FUNCTION sincronizar_turno_padres();

-- Función para asignar turno a padres cuando se crea relación familiar
CREATE OR REPLACE FUNCTION asignar_turno_padre_al_crear_relacion()
RETURNS TRIGGER AS $$
DECLARE
    turno_estudiante VARCHAR(10);
BEGIN
    SELECT turno INTO turno_estudiante
    FROM Usuarios
    WHERE id_usuario = NEW.id_estudiante;
    
    IF turno_estudiante IS NOT NULL THEN
        UPDATE Usuarios 
        SET turno = turno_estudiante 
        WHERE id_usuario = NEW.id_padre AND rol = 'Padre';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar turno al crear relación familiar
DROP TRIGGER IF EXISTS trigger_asignar_turno_padre ON Relacion_Familiar;
CREATE TRIGGER trigger_asignar_turno_padre
    AFTER INSERT ON Relacion_Familiar
    FOR EACH ROW
    EXECUTE FUNCTION asignar_turno_padre_al_crear_relacion();

-- Función para verificar conflictos de horario para un docente
CREATE OR REPLACE FUNCTION verificar_conflicto_horario_docente()
RETURNS TRIGGER AS $$
DECLARE
    conflicto_existente INTEGER;
BEGIN
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

-- Trigger para verificar conflictos de horario
DROP TRIGGER IF EXISTS trigger_verificar_conflicto_horario_docente ON Horarios;
CREATE TRIGGER trigger_verificar_conflicto_horario_docente
    BEFORE INSERT OR UPDATE ON Horarios
    FOR EACH ROW
    EXECUTE FUNCTION verificar_conflicto_horario_docente();

-- Función para verificar conflictos de horario para un salón
CREATE OR REPLACE FUNCTION verificar_conflicto_horario_salon()
RETURNS TRIGGER AS $$
DECLARE
    conflicto_existente INTEGER;
BEGIN
    IF NEW.id_salon IS NULL THEN
        RETURN NEW;
    END IF;
    
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

-- Trigger para verificar conflictos de salón
DROP TRIGGER IF EXISTS trigger_verificar_conflicto_horario_salon ON Horarios;
CREATE TRIGGER trigger_verificar_conflicto_horario_salon
    BEFORE INSERT OR UPDATE ON Horarios
    FOR EACH ROW
    EXECUTE FUNCTION verificar_conflicto_horario_salon();

-- Función para eliminar usuarios inactivos por más de 1 mes
CREATE OR REPLACE FUNCTION eliminar_usuarios_inactivos()
RETURNS TABLE(
    usuarios_eliminados INTEGER,
    detalles TEXT
) AS $$
DECLARE
    usuario_record RECORD;
    usuarios_eliminados_count INTEGER := 0;
    detalles_text TEXT := '';
    usuarios_eliminados_list TEXT[] := ARRAY[]::TEXT[];
BEGIN
    FOR usuario_record IN
        SELECT 
            id_usuario,
            nombre,
            apellido,
            correo,
            rol,
            fecha_actualizacion,
            activo
        FROM Usuarios
        WHERE activo = false
        AND fecha_actualizacion < (CURRENT_DATE - INTERVAL '1 month')
        AND rol != 'Administrador'
    LOOP
        DECLARE
            tiene_matriculas BOOLEAN := false;
            tiene_relaciones BOOLEAN := false;
            tiene_mensajes BOOLEAN := false;
            tiene_entregas BOOLEAN := false;
        BEGIN
            SELECT EXISTS(
                SELECT 1 FROM Matricula 
                WHERE (id_estudiante = usuario_record.id_usuario OR id_curso IN (
                    SELECT id_curso FROM Cursos WHERE id_curso IN (
                        SELECT id_curso FROM Curso_Docente WHERE id_docente = usuario_record.id_usuario
                    )
                ))
                AND estado = 'Activo'
            ) INTO tiene_matriculas;

            SELECT EXISTS(
                SELECT 1 FROM Relacion_Familiar 
                WHERE (id_padre = usuario_record.id_usuario OR id_estudiante = usuario_record.id_usuario)
                AND activo = true
            ) INTO tiene_relaciones;

            SELECT EXISTS(
                SELECT 1 FROM Mensajes 
                WHERE (id_emisor = usuario_record.id_usuario OR id_receptor = usuario_record.id_usuario)
                AND fecha_envio > (CURRENT_DATE - INTERVAL '3 months')
            ) INTO tiene_mensajes;

            SELECT EXISTS(
                SELECT 1 FROM Entregas 
                WHERE id_estudiante = usuario_record.id_usuario
                AND fecha_entrega > (CURRENT_DATE - INTERVAL '3 months')
            ) INTO tiene_entregas;

            IF NOT (tiene_matriculas OR tiene_relaciones OR tiene_mensajes OR tiene_entregas) THEN
                DELETE FROM Relacion_Familiar 
                WHERE (id_padre = usuario_record.id_usuario OR id_estudiante = usuario_record.id_usuario)
                AND activo = false;

                DELETE FROM Usuarios WHERE id_usuario = usuario_record.id_usuario;
                
                usuarios_eliminados_count := usuarios_eliminados_count + 1;
                usuarios_eliminados_list := array_append(
                    usuarios_eliminados_list,
                    format('%s %s (%s) - Rol: %s', 
                        usuario_record.nombre, 
                        usuario_record.apellido, 
                        usuario_record.correo,
                        usuario_record.rol
                    )
                );
            END IF;
        END;
    END LOOP;

    IF usuarios_eliminados_count > 0 THEN
        detalles_text := array_to_string(usuarios_eliminados_list, '; ');
    ELSE
        detalles_text := 'No se encontraron usuarios inactivos por más de 1 mes sin relaciones activas.';
    END IF;

    RETURN QUERY SELECT usuarios_eliminados_count, detalles_text;
END;
$$ LANGUAGE plpgsql;

-- Función wrapper para ejecutar limpieza de usuarios inactivos
CREATE OR REPLACE FUNCTION ejecutar_limpieza_usuarios_inactivos()
RETURNS JSON AS $$
DECLARE
    resultado RECORD;
    json_result JSON;
BEGIN
    SELECT * INTO resultado FROM eliminar_usuarios_inactivos();
    
    json_result := json_build_object(
        'success', true,
        'usuarios_eliminados', resultado.usuarios_eliminados,
        'detalles', resultado.detalles,
        'fecha_ejecucion', CURRENT_TIMESTAMP
    );
    
    RETURN json_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON DATABASE plataforma_educativa IS 'Base de datos para la plataforma educativa';
COMMENT ON TABLE Usuarios IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE Cursos IS 'Cursos académicos disponibles';
COMMENT ON TABLE Matricula IS 'Relación entre estudiantes y cursos';
COMMENT ON TABLE Tareas IS 'Tareas asignadas en los cursos';
COMMENT ON TABLE Entregas IS 'Entregas de tareas por estudiantes';
COMMENT ON TABLE Contenidos IS 'Contenidos multimedia de los cursos';
COMMENT ON TABLE Mensajes IS 'Sistema de mensajería interna';
COMMENT ON TABLE Notificaciones IS 'Notificaciones del sistema';
COMMENT ON TABLE Relacion_Familiar IS 'Relaciones familiares entre padres y estudiantes';
COMMENT ON TABLE Salones IS 'Salones de clase con capacidad máxima de estudiantes';
COMMENT ON TABLE Curso_Docente IS 'Relación muchos-a-muchos entre Cursos y Docentes';
COMMENT ON TABLE Horarios IS 'Horarios semanales de los cursos con docentes y salones asignados';

COMMENT ON COLUMN Salones.capacidad_maxima IS 'Capacidad máxima de estudiantes (por defecto 40)';
COMMENT ON COLUMN Matricula.id_salon IS 'Salón al que pertenece el estudiante';
COMMENT ON COLUMN Salones.turno IS 'Turno del salón: Mañana o Tarde';
COMMENT ON COLUMN Usuarios.turno IS 'Turno del usuario: Mañana o Tarde (se sincroniza automáticamente entre estudiantes y padres)';
COMMENT ON COLUMN Cursos.turno IS 'Turno del curso (Mañana o Tarde)';
COMMENT ON COLUMN Horarios.dia_semana IS 'Día de la semana (Lunes a Viernes)';
COMMENT ON COLUMN Horarios.turno IS 'Turno del horario (Mañana o Tarde)';
COMMENT ON COLUMN Entregas.calificacion IS 'Calificación de 0 a 20';

COMMENT ON FUNCTION eliminar_usuarios_inactivos() IS 'Elimina usuarios que han estado inactivos por más de 1 mes y no tienen relaciones activas';
COMMENT ON FUNCTION ejecutar_limpieza_usuarios_inactivos() IS 'Función wrapper para ejecutar la limpieza de usuarios inactivos y retornar resultado en JSON';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

