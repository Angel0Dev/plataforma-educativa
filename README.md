# 🎓 Plataforma Educativa

Una plataforma web completa para la gestión de experiencia educativa, desarrollada con arquitectura de microservicios usando el stack MERN/PERN.

## 🏗️ Arquitectura

- **Backend**: Node.js/Express.js (Microservicio)
- **Frontend**: React.js
- **Base de Datos**: PostgreSQL
- **Autenticación**: bcryptjs para hashing de contraseñas

## 📋 Características Principales

### ✅ Implementadas
- ✅ Registro de usuarios (Docente, Estudiante, Padre)
- ✅ Hashing seguro de contraseñas con bcryptjs
- ✅ Interfaz de registro moderna y responsive
- ✅ Conexión a PostgreSQL con pool de conexiones
- ✅ API REST para gestión de usuarios
- ✅ Validación de datos en frontend y backend

### 🚧 En Desarrollo
- 🔄 Sistema de autenticación JWT
- 🔄 Gestión de cursos y tareas
- 🔄 Sistema de mensajería
- 🔄 Notificaciones en tiempo real
- 🔄 Panel de administración

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### 1. Configuración de la Base de Datos

#### Opción A: Usando pgAdmin4
1. Abre pgAdmin4
2. Crea una nueva base de datos llamada `plataforma_educativa`
3. Ejecuta el script `database/schema.sql` en el Query Tool

#### Opción B: Usando psql
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE plataforma_educativa;

# Conectar a la nueva base de datos
\c plataforma_educativa

# Ejecutar el script
\i database/schema.sql
```

### 2. Configuración del Backend

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env

# Editar el archivo .env con tus credenciales de PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=plataforma_educativa
# DB_USER=postgres
# DB_PASSWORD=tu_password

# Iniciar el servidor en modo desarrollo
npm run dev

# O iniciar en modo producción
npm start
```

### 3. Configuración del Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar la aplicación
npm start
```

## 📁 Estructura del Proyecto

```
plataforma_educativa/
├── backend/
│   ├── config/
│   │   └── db.config.js          # Configuración de PostgreSQL
│   ├── controllers/
│   │   └── user.controller.js    # Controlador de usuarios
│   ├── routes/
│   │   └── user.routes.js        # Rutas de usuarios
│   ├── server.js                 # Servidor principal
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Registro.js       # Componente de registro
│   │   │   └── Registro.css      # Estilos del registro
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── database/
│   └── schema.sql                # Script de migración
└── README.md
```

## 🔧 API Endpoints

### Usuarios
- `POST /api/usuarios/registro` - Registrar nuevo usuario
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID

### Sistema
- `GET /api/health` - Estado del servidor y base de datos
- `GET /` - Información de la API

## 📊 Base de Datos

### Tablas Principales
- **Usuarios**: Información de usuarios del sistema
- **Cursos**: Cursos académicos
- **Matricula**: Relación estudiantes-cursos
- **Tareas**: Tareas asignadas
- **Entregas**: Entregas de estudiantes
- **Contenidos**: Material multimedia
- **Mensajes**: Sistema de mensajería
- **Notificaciones**: Notificaciones del sistema
- **Relacion_Familiar**: Relaciones padre-estudiante

## 🛡️ Seguridad

- Contraseñas hasheadas con bcryptjs (12 salt rounds)
- Validación de datos en frontend y backend
- CORS configurado para desarrollo
- Manejo de errores centralizado
- Pool de conexiones para PostgreSQL

## 🎨 Interfaz de Usuario

- Diseño moderno y responsive
- Gradientes y animaciones CSS
- Formularios validados
- Mensajes de feedback al usuario
- Compatible con dispositivos móviles

## 🔄 Flujo de Registro

1. Usuario completa el formulario de registro
2. Frontend valida los datos
3. Datos se envían al backend via axios
4. Backend valida y hashea la contraseña
5. Usuario se guarda en PostgreSQL
6. Respuesta de confirmación al frontend

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos existe

### Error CORS
- Verifica que el frontend esté ejecutándose en el puerto 3000
- Confirma la configuración de CORS en `server.js`

### Error de dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

## 📝 Variables de Entorno

```env
# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plataforma_educativa
DB_USER=postgres
DB_PASSWORD=tu_password
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Full-Stack**: Tu Nombre
- **Arquitectura**: Microservicios MERN/PERN
- **Base de Datos**: PostgreSQL con pgAdmin4

---

**¡Gracias por usar la Plataforma Educativa! 🎓**
