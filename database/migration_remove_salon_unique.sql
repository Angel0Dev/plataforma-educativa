-- =====================================================
-- MIGRACIÓN: Eliminar restricción UNIQUE de nombre_salon
-- Permite que los nombres de salón se repitan
-- =====================================================

-- 1. Eliminar la restricción UNIQUE si existe
DO $$ 
BEGIN
    -- Buscar y eliminar la restricción UNIQUE en nombre_salon
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'salones' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%nombre_salon%'
    ) THEN
        -- Obtener el nombre de la restricción
        DECLARE
            constraint_name_var TEXT;
        BEGIN
            SELECT constraint_name INTO constraint_name_var
            FROM information_schema.table_constraints 
            WHERE table_name = 'salones' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%nombre_salon%'
            LIMIT 1;
            
            IF constraint_name_var IS NOT NULL THEN
                EXECUTE 'ALTER TABLE Salones DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
            END IF;
        END;
    END IF;
    
    -- También intentar eliminar por nombre común
    ALTER TABLE Salones DROP CONSTRAINT IF EXISTS salones_nombre_salon_key;
    ALTER TABLE Salones DROP CONSTRAINT IF EXISTS salones_nombre_salon_unique;
END $$;

-- 2. Verificar que la restricción fue eliminada
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'salones' 
AND constraint_type = 'UNIQUE'
AND constraint_name LIKE '%nombre_salon%';

-- Si la consulta anterior no devuelve resultados, la restricción fue eliminada correctamente

