# 📊 Guía de Migración a pgAdmin4

Esta guía te ayudará a configurar la base de datos PostgreSQL usando pgAdmin4 para la Plataforma Educativa.

## 🔧 Prerrequisitos

1. **PostgreSQL instalado** (versión 12 o superior)
2. **pgAdmin4 instalado** y ejecutándose
3. **Credenciales de acceso** a PostgreSQL (usuario y contraseña)

## 📋 Pasos para la Configuración

### 1. Conectar a PostgreSQL desde pgAdmin4

1. **Abrir pgAdmin4**
2. **Conectar al servidor PostgreSQL:**
   - Click derecho en "Servers" → "Register" → "Server"
   - En la pestaña "General":
     - **Name**: `Plataforma Educativa` (o el nombre que prefieras)
   - En la pestaña "Connection":
     - **Host name/address**: `localhost` (o tu IP del servidor)
     - **Port**: `5432`
     - **Maintenance database**: `postgres`
     - **Username**: `postgres` (o tu usuario)
     - **Password**: '8M~Yd'CM7rd#?nj'
   - Click "Save"

### 2. Crear la Base de Datos

1. **Expandir el servidor** recién creado
2. **Click derecho en "Databases"** → "Create" → "Database"
3. **Configurar la base de datos:**
   - **Database**: `plataforma_educativa`
   - **Owner**: `postgres` (o tu usuario)
   - **Template**: `template0` (recomendado)
   - **Encoding**: `UTF8`
   - **Collation**: `en_US.UTF-8` (o tu configuración regional)
   - **Character type**: `en_US.UTF-8`
4. **Click "Save"**

### 3. Ejecutar el Script de Migración

1. **Seleccionar la base de datos** `plataforma_educativa`
2. **Click en "Query Tool"** (icono de SQL en la barra de herramientas)
3. **Abrir el archivo de script:**
   - File → Open → Navegar a `database/schema.sql`
4. **Ejecutar el script:**
   - Click en el botón "Execute" (▶️) o presiona `F5`
5. **Verificar la ejecución:**
   - Deberías ver mensajes de éxito en la pestaña "Messages"
   - Las tablas deberían aparecer en el árbol de la izquierda

### 4. Verificar la Instalación

1. **Expandir la base de datos** `plataforma_educativa`
2. **Expandir "Schemas"** → "public" → "Tables"
3. **Verificar que se crearon las siguientes tablas:**
   - ✅ `Usuarios`
   - ✅ `Cursos`
   - ✅ `Matricula`
   - ✅ `Tareas`
   - ✅ `Entregas`
   - ✅ `Contenidos`
   - ✅ `Mensajes`
   - ✅ `Notificaciones`
   - ✅ `Relacion_Familiar`
   - ✅ `Sesiones_Usuario`
   - ✅ `Logs_Actividad`

## 🎯 Datos de Ejemplo

El script incluye datos de ejemplo para probar la funcionalidad:

```sql
-- Usuarios de ejemplo (contraseña: "password123")
- Docente: juan.perez@email.com
- Estudiante: maria.gonzalez@email.com  
- Padre: carlos.rodriguez@email.com
```

## ⚙️ Configuración de Variables de Entorno

Una vez creada la base de datos, configura el archivo `backend/.env`:

```env
# Configuración de Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plataforma_educativa
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
```

## 🔍 Verificación de Conexión

Para verificar que la conexión funciona correctamente:

1. **Iniciar el backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verificar en la consola:**
   ```
   ✅ Conexión a PostgreSQL establecida correctamente
   🚀 Servidor iniciado exitosamente!
   ```

3. **Probar el endpoint de salud:**
   - Abrir navegador: `http://localhost:3001/api/health`
   - Deberías ver: `"database": "Conectado"`

## 🛠️ Solución de Problemas Comunes

### Error: "database does not exist"
- **Solución**: Verifica que creaste la base de datos `plataforma_educativa`
- **Verificar**: Expande tu servidor en pgAdmin4 y busca la base de datos

### Error: "password authentication failed"
- **Solución**: Verifica las credenciales en el archivo `.env`
- **Verificar**: Intenta conectarte manualmente desde pgAdmin4

### Error: "connection refused"
- **Solución**: Verifica que PostgreSQL esté ejecutándose
- **Verificar**: En Windows, verifica el servicio "postgresql-x64-XX"

### Error: "relation does not exist"
- **Solución**: Verifica que ejecutaste completamente el script `schema.sql`
- **Verificar**: Revisa la pestaña "Messages" en pgAdmin4

### Error: "permission denied"
- **Solución**: Asegúrate de que tu usuario tenga permisos en la base de datos
- **Verificar**: En pgAdmin4, click derecho en la base de datos → Properties → Privileges

## 📊 Estructura de Tablas

### Tabla Principal: Usuarios
```sql
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    codigo_orcid VARCHAR(20),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(15) NOT NULL CHECK (rol IN ('Docente', 'Estudiante', 'Padre')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);
```

### Relaciones Principales
- **Usuarios** → **Cursos** (1:N - Un docente puede tener múltiples cursos)
- **Usuarios** → **Matricula** (1:N - Un estudiante puede estar en múltiples cursos)
- **Cursos** → **Tareas** (1:N - Un curso puede tener múltiples tareas)
- **Tareas** → **Entregas** (1:N - Una tarea puede tener múltiples entregas)

## 🔐 Seguridad

### Contraseñas Hasheadas
- Las contraseñas se almacenan con hash bcrypt (12 salt rounds)
- Las contraseñas de ejemplo están hasheadas para `password123`

### Índices de Rendimiento
- Índices en campos de búsqueda frecuente (correo, rol, etc.)
- Índices en relaciones entre tablas

## 📈 Próximos Pasos

1. **Configurar el backend** con las credenciales correctas
2. **Iniciar los servidores** (backend y frontend)
3. **Probar el registro** de usuarios desde la interfaz web
4. **Implementar autenticación JWT** (próxima fase)
5. **Agregar funcionalidades** de cursos y tareas

---

**¡Base de datos configurada exitosamente! 🎉**

Para cualquier problema, revisa los logs del backend o consulta la documentación de PostgreSQL.
