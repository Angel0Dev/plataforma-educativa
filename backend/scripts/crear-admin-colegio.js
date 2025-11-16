const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// Configuración de la base de datos desde el archivo .env
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'colegio', // Usar 'colegio' como predeterminado
    password: process.env.DB_PASSWORD || "8M~Yd'CM7rd#?nj",
    port: process.env.DB_PORT || 5432,
};

console.log('🔍 Configuración de base de datos:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Puerto: ${dbConfig.port}`);
console.log(`   Base de datos: ${dbConfig.database}`);
console.log(`   Usuario: ${dbConfig.user}\n`);

const pool = new Pool(dbConfig);

async function crearUsuarioAdmin() {
    try {
        console.log('🔍 Verificando conexión a la base de datos...');
        
        // Verificar conexión
        const testConnection = await pool.query('SELECT NOW(), current_database() as db');
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        console.log(`✅ Base de datos conectada: ${testConnection.rows[0].db}\n`);
        
        // Verificar si la tabla Usuarios existe
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'Usuarios'
            );
        `);
        
        if (!tableExists.rows[0].exists) {
            console.log('❌ La tabla "Usuarios" no existe en esta base de datos.');
            console.log('   Por favor, ejecuta primero el script de creación de esquema.\n');
            process.exit(1);
        }
        
        const nombre = 'Admin';
        const apellido = 'Sistema';
        const correo = 'admin@plataforma.edu';
        const contrasena = 'admin123';
        const rol = 'Administrador';

        // Verificar si el usuario ya existe
        const usuarioExistente = await pool.query(
            'SELECT id_usuario, correo, rol, activo FROM Usuarios WHERE correo = $1',
            [correo]
        );

        if (usuarioExistente.rows.length > 0) {
            console.log('⚠️  El usuario administrador ya existe.');
            console.log('   Actualizando información...\n');
            
            // Hash de la contraseña
            const saltRounds = 12;
            const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

            // Actualizar usuario existente
            const resultado = await pool.query(
                `UPDATE Usuarios 
                 SET nombre = $1, 
                     apellido = $2, 
                     contrasena = $3, 
                     rol = $4, 
                     activo = true,
                     fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE correo = $5
                 RETURNING id_usuario, nombre, apellido, correo, rol, activo`,
                [nombre, apellido, contrasenaHash, rol, correo]
            );

            const usuario = resultado.rows[0];
            console.log('✅ Usuario administrador actualizado exitosamente:');
            console.log(`   ID: ${usuario.id_usuario}`);
            console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
            console.log(`   Correo: ${usuario.correo}`);
            console.log(`   Rol: ${usuario.rol}`);
            console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}\n`);
            
            // Verificar que la contraseña funciona
            const contrasenaValida = await bcrypt.compare(contrasena, contrasenaHash);
            console.log(`🔐 Verificación de contraseña: ${contrasenaValida ? '✅ Funciona correctamente' : '❌ No funciona'}\n`);
        } else {
            console.log('📝 Creando nuevo usuario administrador...\n');
            
            // Hash de la contraseña
            const saltRounds = 12;
            const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

            // Insertar nuevo usuario
            const resultado = await pool.query(
                `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, activo) 
                 VALUES ($1, $2, $3, $4, $5, true) 
                 RETURNING id_usuario, nombre, apellido, correo, rol, activo`,
                [nombre, apellido, correo, contrasenaHash, rol]
            );

            const usuario = resultado.rows[0];
            console.log('✅ Usuario administrador creado exitosamente:');
            console.log(`   ID: ${usuario.id_usuario}`);
            console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
            console.log(`   Correo: ${usuario.correo}`);
            console.log(`   Rol: ${usuario.rol}`);
            console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}\n`);
        }

        // Contar total de usuarios
        const totalUsuarios = await pool.query('SELECT COUNT(*) as total FROM Usuarios');
        console.log(`📊 Total de usuarios en la base de datos: ${totalUsuarios.rows[0].total}\n`);

        console.log('📋 Credenciales de acceso:');
        console.log(`   Correo: ${correo}`);
        console.log(`   Contraseña: ${contrasena}\n`);
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión.\n');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error.message);
        console.error('   Detalles:', error);
        await pool.end();
        process.exit(1);
    }
}

// Ejecutar la función
crearUsuarioAdmin();

