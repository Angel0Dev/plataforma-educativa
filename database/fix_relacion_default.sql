-- Script para corregir el DEFAULT de la columna relacion en Relacion_Familiar
-- El DEFAULT 'Padre/Madre' no es válido según la restricción CHECK

-- Paso 1: Actualizar registros existentes con 'Padre/Madre' a 'Padre'
UPDATE Relacion_Familiar 
SET relacion = 'Padre' 
WHERE relacion = 'Padre/Madre';

-- Paso 2: Eliminar el DEFAULT actual
ALTER TABLE Relacion_Familiar ALTER COLUMN relacion DROP DEFAULT;

-- Paso 3: Establecer un nuevo DEFAULT válido
ALTER TABLE Relacion_Familiar ALTER COLUMN relacion SET DEFAULT 'Padre';

-- Paso 4: Verificar que el cambio se aplicó correctamente
SELECT 
    column_name, 
    column_default,
    data_type
FROM information_schema.columns 
WHERE table_name = 'relacion_familiar' 
AND column_name = 'relacion';

-- Paso 5: Verificar que no hay registros con valores inválidos
SELECT COUNT(*) as registros_invalidos
FROM Relacion_Familiar 
WHERE relacion NOT IN ('Padre', 'Madre', 'Tutor', 'Representante');

