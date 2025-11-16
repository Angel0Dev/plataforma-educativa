-- =====================================================
-- SCRIPT PARA INSERTAR USUARIO ADMINISTRADOR DE PRUEBA
-- Ejecutar este script en pgAdmin4 o psql
-- =====================================================

-- Contraseña: admin123 (hasheada con bcrypt)
-- Puedes cambiar la contraseña después de iniciar sesión

INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, activo)
VALUES (
    'Admin',
    'Sistema',
    'admin@plataforma.edu',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdX7r.8V4K9K2', -- admin123
    'Administrador',
    true
)
ON CONFLICT (correo) DO UPDATE 
SET 
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo,
    fecha_actualizacion = CURRENT_TIMESTAMP;

-- Verificar que el usuario se creó correctamente
SELECT 
    id_usuario,
    nombre,
    apellido,
    correo,
    rol,
    activo,
    fecha_creacion
FROM Usuarios 
WHERE correo = 'admin@plataforma.edu';

