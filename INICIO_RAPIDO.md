# 🚀 Inicio Rápido - Plataforma Educativa

Esta guía te permitirá poner en funcionamiento la plataforma en menos de 10 minutos.

## ⚡ Instalación Automática

### Windows
```bash
# Ejecutar el script de configuración
setup.bat
```

### Linux/macOS
```bash
# Dar permisos de ejecución y ejecutar
chmod +x setup.sh
./setup.sh
```

## 📊 Configuración Manual de la Base de Datos

### 1. Crear Base de Datos en pgAdmin4
1. Abrir pgAdmin4
2. Crear nueva base de datos: `plataforma_educativa`
3. Ejecutar el script: `database/schema.sql`

### 2. Configurar Variables de Entorno
Editar `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plataforma_educativa
DB_USER=postgres
DB_PASSWORD=tu_password
```

## 🎯 Iniciar la Aplicación

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## 🌐 Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## ✅ Verificación

1. **Backend funcionando**: Ver mensaje "✅ Conexión a PostgreSQL establecida"
2. **Frontend funcionando**: Ver página de inicio en el navegador
3. **Registro funcionando**: Ir a `/registro` y crear un usuario

## 🎓 ¡Listo!

Tu plataforma educativa está funcionando. Puedes registrar usuarios y comenzar a desarrollar las funcionalidades adicionales.

---

**¿Necesitas ayuda?** Revisa el `README.md` completo o las instrucciones en `database/INSTRUCCIONES_PGADMIN4.md`
