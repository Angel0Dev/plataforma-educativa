-- =====================================================
-- SCRIPT DE MIGRACIÓN PARA PGADMIN4
-- Plataforma Educativa - Base de Datos PostgreSQL
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
    dni VARCHAR(20) UNIQUE, -- DNI para padres y estudiantes
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20), -- Teléfono de contacto
    direccion TEXT, -- Dirección de contacto
    rol VARCHAR(15) NOT NULL CHECK (rol IN ('Docente', 'Estudiante', 'Padre', 'Administrador')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON Usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON Usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON Usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON Usuarios(activo);

-- =====================================================
-- 2. MÓDULO ACADÉMICO Y DE TAREAS
-- =====================================================

CREATE TABLE IF NOT EXISTS Cursos (
    id_curso SERIAL PRIMARY KEY,
    nombre_curso VARCHAR(100) NOT NULL,
    descripcion TEXT,
    id_docente INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Matricula (
    id_matricula SERIAL PRIMARY KEY,
    id_estudiante INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
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
    calificacion NUMERIC(4, 2) CHECK (calificacion >= 0 AND calificacion <= 100),
    feedback_docente TEXT,
    archivo_adjunto VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'Entregado' CHECK (estado IN ('Entregado', 'Calificado', 'Rechazado')),
    UNIQUE(id_tarea, id_estudiante)
);

-- Índices para el módulo académico
CREATE INDEX IF NOT EXISTS idx_cursos_docente ON Cursos(id_docente);
CREATE INDEX IF NOT EXISTS idx_matricula_estudiante ON Matricula(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_matricula_curso ON Matricula(id_curso);
CREATE INDEX IF NOT EXISTS idx_tareas_curso ON Tareas(id_curso);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_limite ON Tareas(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_entregas_tarea ON Entregas(id_tarea);
CREATE INDEX IF NOT EXISTS idx_entregas_estudiante ON Entregas(id_estudiante);

-- =====================================================
-- 3. MÓDULO DE CONTENIDOS
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
-- 4. MÓDULO DE COMUNICACIÓN Y NOTIFICACIONES
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
-- 5. MÓDULO DE RELACIÓN FAMILIAR
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
-- 6. TABLAS ADICIONALES PARA FUNCIONALIDADES EXTENDIDAS
-- =====================================================

-- Tabla para sesiones de usuario (para futuras implementaciones de autenticación)
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

-- Tabla para logs de actividad del sistema
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
-- 7. FUNCIONES Y TRIGGERS
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
CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON Usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- =====================================================
-- 8. DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar algunos usuarios de ejemplo
INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdX7r.8V4K9K2', 'Docente'),
('María', 'González', 'maria.gonzalez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdX7r.8V4K9K2', 'Estudiante'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdX7r.8V4K9K2', 'Padre')
ON CONFLICT (correo) DO NOTHING;

-- =====================================================
-- 9. COMENTARIOS Y DOCUMENTACIÓN
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
