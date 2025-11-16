-- =====================================================
-- MIGRACIÓN: Eliminación automática de usuarios inactivos
-- =====================================================
-- Esta migración crea una función y un trigger para eliminar
-- automáticamente usuarios que han estado inactivos por más de 1 mes
-- =====================================================

-- 1. Crear función para eliminar usuarios inactivos por más de 1 mes
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
    -- Buscar usuarios inactivos por más de 1 mes
    -- Se considera inactivo si activo = false Y fecha_actualizacion < (CURRENT_DATE - INTERVAL '1 month')
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
        AND rol != 'Administrador' -- No eliminar administradores
    LOOP
        -- Verificar si el usuario tiene relaciones que impidan su eliminación
        -- Si tiene matrículas activas, relaciones familiares activas, etc., no se elimina
        DECLARE
            tiene_matriculas BOOLEAN := false;
            tiene_relaciones BOOLEAN := false;
            tiene_mensajes BOOLEAN := false;
            tiene_entregas BOOLEAN := false;
        BEGIN
            -- Verificar matrículas
            SELECT EXISTS(
                SELECT 1 FROM Matricula 
                WHERE (id_estudiante = usuario_record.id_usuario OR id_curso IN (
                    SELECT id_curso FROM Cursos WHERE id_curso IN (
                        SELECT id_curso FROM Curso_Docente WHERE id_docente = usuario_record.id_usuario
                    )
                ))
                AND estado = 'Activo'
            ) INTO tiene_matriculas;

            -- Verificar relaciones familiares activas
            SELECT EXISTS(
                SELECT 1 FROM Relacion_Familiar 
                WHERE (id_padre = usuario_record.id_usuario OR id_estudiante = usuario_record.id_usuario)
                AND activo = true
            ) INTO tiene_relaciones;

            -- Verificar mensajes recientes (últimos 3 meses)
            SELECT EXISTS(
                SELECT 1 FROM Mensajes 
                WHERE (id_emisor = usuario_record.id_usuario OR id_receptor = usuario_record.id_usuario)
                AND fecha_envio > (CURRENT_DATE - INTERVAL '3 months')
            ) INTO tiene_mensajes;

            -- Verificar entregas recientes (últimos 3 meses)
            SELECT EXISTS(
                SELECT 1 FROM Entregas 
                WHERE id_estudiante = usuario_record.id_usuario
                AND fecha_entrega > (CURRENT_DATE - INTERVAL '3 months')
            ) INTO tiene_entregas;

            -- Solo eliminar si no tiene relaciones activas o recientes
            IF NOT (tiene_matriculas OR tiene_relaciones OR tiene_mensajes OR tiene_entregas) THEN
                -- Eliminar relaciones familiares inactivas primero (CASCADE debería hacerlo, pero lo hacemos explícitamente)
                DELETE FROM Relacion_Familiar 
                WHERE (id_padre = usuario_record.id_usuario OR id_estudiante = usuario_record.id_usuario)
                AND activo = false;

                -- Eliminar el usuario (CASCADE eliminará automáticamente las relaciones dependientes)
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

    -- Construir detalles
    IF usuarios_eliminados_count > 0 THEN
        detalles_text := array_to_string(usuarios_eliminados_list, '; ');
    ELSE
        detalles_text := 'No se encontraron usuarios inactivos por más de 1 mes sin relaciones activas.';
    END IF;

    RETURN QUERY SELECT usuarios_eliminados_count, detalles_text;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION eliminar_usuarios_inactivos() IS 'Elimina usuarios que han estado inactivos por más de 1 mes y no tienen relaciones activas';

-- 2. Crear función que se ejecute automáticamente (usando pg_cron si está disponible)
-- Nota: pg_cron requiere extensión adicional. Si no está disponible, se puede ejecutar manualmente
-- o desde el backend periódicamente.

-- 3. Crear una función wrapper que se pueda llamar desde el backend
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

COMMENT ON FUNCTION ejecutar_limpieza_usuarios_inactivos() IS 'Función wrapper para ejecutar la limpieza de usuarios inactivos y retornar resultado en JSON';

-- 4. Si pg_cron está disponible, crear un job programado (opcional)
-- Descomentar si tienes pg_cron instalado:
/*
SELECT cron.schedule(
    'limpiar-usuarios-inactivos',  -- nombre del job
    '0 2 * * *',                    -- ejecutar todos los días a las 2 AM
    $$SELECT ejecutar_limpieza_usuarios_inactivos();$$
);
*/

-- 5. Crear índice para mejorar el rendimiento de la consulta
CREATE INDEX IF NOT EXISTS idx_usuarios_inactivos_limpieza 
ON Usuarios(activo, fecha_actualizacion) 
WHERE activo = false;

COMMENT ON INDEX idx_usuarios_inactivos_limpieza IS 'Índice para optimizar la búsqueda de usuarios inactivos para limpieza automática';

-- 6. Verificar que las funciones se crearon correctamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'eliminar_usuarios_inactivos') THEN
        RAISE NOTICE '✓ Función eliminar_usuarios_inactivos() creada exitosamente';
    ELSE
        RAISE EXCEPTION 'Error: No se pudo crear la función eliminar_usuarios_inactivos()';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'ejecutar_limpieza_usuarios_inactivos') THEN
        RAISE NOTICE '✓ Función ejecutar_limpieza_usuarios_inactivos() creada exitosamente';
    ELSE
        RAISE EXCEPTION 'Error: No se pudo crear la función ejecutar_limpieza_usuarios_inactivos()';
    END IF;
END $$;

