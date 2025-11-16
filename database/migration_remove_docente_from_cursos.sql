-- =====================================================
-- MIGRACIÓN: Eliminar campo id_docente de Cursos
-- Los docentes ahora se asignan a través de Curso_Docente
-- =====================================================

-- 1. Eliminar la restricción de clave foránea si existe
DO $$ 
BEGIN
    -- Buscar y eliminar la restricción de clave foránea
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'cursos' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%id_docente%'
    ) THEN
        DECLARE
            constraint_name_var TEXT;
        BEGIN
            SELECT constraint_name INTO constraint_name_var
            FROM information_schema.table_constraints 
            WHERE table_name = 'cursos' 
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%id_docente%'
            LIMIT 1;
            
            IF constraint_name_var IS NOT NULL THEN
                EXECUTE 'ALTER TABLE Cursos DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
            END IF;
        END;
    END IF;
    
    -- También intentar eliminar por nombres comunes
    ALTER TABLE Cursos DROP CONSTRAINT IF EXISTS cursos_id_docente_fkey;
    ALTER TABLE Cursos DROP CONSTRAINT IF EXISTS fk_cursos_docente;
END $$;

-- 2. Eliminar la columna id_docente
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cursos' AND column_name = 'id_docente'
    ) THEN
        ALTER TABLE Cursos DROP COLUMN id_docente;
    END IF;
END $$;

-- 3. Verificar que la columna fue eliminada
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND column_name = 'id_docente';

-- Si la consulta anterior no devuelve resultados, la columna fue eliminada correctamente

