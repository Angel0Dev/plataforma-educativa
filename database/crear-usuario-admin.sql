-- =====================================================
-- SCRIPT PARA VERIFICAR Y CREAR USUARIO ADMINISTRADOR
-- Ejecutar este script en pgAdmin4 o psql
-- =====================================================

-- Verificar que estamos en la base de datos correcta
SELECT 
    current_database() as base_datos,
    current_user as usuario,
    current_schema() as esquema;

-- Verificar si el usuario admin existe
SELECT 
    id_usuario,
    nombre,
    apellido,
    correo,
    rol,
    activo,
    fecha_creacion,
    fecha_actualizacion
FROM Usuarios 
WHERE correo = 'admin@plataforma.edu';

-- Si el usuario no existe o necesitas recrearlo, ejecuta lo siguiente:

-- Primero, eliminar el usuario si existe (opcional, solo si quieres recrearlo)
-- DELETE FROM Usuarios WHERE correo = 'admin@plataforma.edu';

-- Insertar o actualizar el usuario administrador
-- Nota: Este hash corresponde a la contraseña "admin123"
INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, activo)
VALUES (
    'Admin',
    'Sistema',
    'admin@plataforma.edu',
    '$2a$12$2pT3PzD12k3QRR/UL/YbWeCmu3xygDuSy4wPixDr0bORB6ZD36bhC', -- admin123
    'Administrador',
    true
)
ON CONFLICT (correo) DO UPDATE 
SET 
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    contrasena = EXCLUDED.contrasena,
    rol = EXCLUDED.rol,
    activo = true,
    fecha_actualizacion = CURRENT_TIMESTAMP;

-- Verificar que el usuario se creó/actualizó correctamente
SELECT 
    id_usuario,
    nombre,
    apellido,
    correo,
    rol,
    activo,
    fecha_creacion,
    fecha_actualizacion,
    LEFT(contrasena, 30) || '...' as hash_primeros_30_chars
FROM Usuarios 
WHERE correo = 'admin@plataforma.edu';

-- Contar total de usuarios
SELECT COUNT(*) as total_usuarios FROM Usuarios;

-- Mostrar todos los usuarios (opcional)
-- SELECT id_usuario, nombre, apellido, correo, rol, activo FROM Usuarios ORDER BY id_usuario;

