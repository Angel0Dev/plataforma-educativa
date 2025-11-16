# 📋 Historias de Usuario - Plataforma Educativa

## Documento de Historias de Usuario

Este documento contiene 30 historias de usuario para la plataforma educativa, organizadas por módulos y prioridades.

---

## 🔐 MÓDULO DE AUTENTICACIÓN Y SEGURIDAD

### Historia #1: Recuperación de Contraseña
**Nombre:** Como usuario, quiero recuperar mi contraseña olvidada para poder acceder nuevamente a mi cuenta.

**Descripción:**
- **Como:** Usuario que olvidó su contraseña
- **Quiero:** Recibir un enlace de recuperación por correo electrónico
- **Para:** Restablecer mi contraseña y acceder a mi cuenta

**Criterios de Aceptación:**
- El usuario puede solicitar recuperación desde la página de login
- Se envía un correo con enlace único de recuperación
- El enlace expira después de 24 horas
- El usuario puede establecer una nueva contraseña segura
- Se valida que la nueva contraseña cumpla con los requisitos de seguridad

**Prioridad:** Alta
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

### Historia #2: Autenticación de Dos Factores (2FA)
**Nombre:** Como usuario, quiero habilitar autenticación de dos factores para aumentar la seguridad de mi cuenta.

**Descripción:**
- **Como:** Usuario preocupado por la seguridad
- **Quiero:** Activar autenticación de dos factores
- **Para:** Proteger mi cuenta con una capa adicional de seguridad

**Criterios de Aceptación:**
- El usuario puede activar 2FA desde su perfil
- Se genera un código QR para configurar en app autenticadora
- Se requiere código 2FA además de contraseña al iniciar sesión
- El usuario puede desactivar 2FA si lo desea
- Se guardan códigos de respaldo para emergencias

**Prioridad:** Media
**Tiempo Estimado:** 16 horas
**Puntos Estimados:** 8

---

### Historia #3: Gestión de Sesiones Activas
**Nombre:** Como usuario, quiero ver y cerrar mis sesiones activas para mantener el control de mi cuenta.

**Descripción:**
- **Como:** Usuario que usa múltiples dispositivos
- **Quiero:** Ver todas mis sesiones activas y cerrar las que no reconozco
- **Para:** Mantener la seguridad de mi cuenta

**Criterios de Aceptación:**
- Se muestra lista de sesiones activas con dispositivo, ubicación y fecha
- El usuario puede cerrar sesiones individuales
- Se puede cerrar todas las sesiones excepto la actual
- Se notifica al usuario cuando se cierra una sesión desde otro dispositivo

**Prioridad:** Media
**Tiempo Estimado:** 6 horas
**Puntos Estimados:** 3

---

## 👥 MÓDULO DE GESTIÓN DE USUARIOS

### Historia #4: Perfil de Usuario Completo
**Nombre:** Como usuario, quiero editar mi perfil personal para mantener mi información actualizada.

**Descripción:**
- **Como:** Usuario de cualquier rol
- **Quiero:** Actualizar mi información personal (nombre, correo, teléfono, foto)
- **Para:** Mantener mis datos actualizados en el sistema

**Criterios de Aceptación:**
- El usuario puede editar todos sus datos personales
- Se puede subir y cambiar foto de perfil
- Se valida que el correo no esté en uso por otro usuario
- Los cambios se guardan correctamente
- Se muestra confirmación de cambios guardados

**Prioridad:** Alta
**Tiempo Estimado:** 6 horas
**Puntos Estimados:** 3

---

### Historia #5: Búsqueda y Filtrado de Usuarios
**Nombre:** Como administrador, quiero buscar y filtrar usuarios para gestionarlos eficientemente.

**Descripción:**
- **Como:** Administrador del sistema
- **Quiero:** Buscar usuarios por nombre, correo, DNI o rol
- **Para:** Encontrar rápidamente usuarios específicos para gestionarlos

**Criterios de Aceptación:**
- Búsqueda en tiempo real por nombre, correo, DNI
- Filtrado por rol (Docente, Estudiante, Padre, Administrador)
- Filtrado por estado (Activo/Inactivo)
- Ordenamiento por fecha de creación, nombre, correo
- Paginación de resultados

**Prioridad:** Alta
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

### Historia #6: Importación Masiva de Usuarios
**Nombre:** Como administrador, quiero importar usuarios desde un archivo CSV para ahorrar tiempo en el registro.

**Descripción:**
- **Como:** Administrador del colegio
- **Quiero:** Subir un archivo CSV con datos de usuarios
- **Para:** Registrar múltiples usuarios de una vez

**Criterios de Aceptación:**
- Se acepta archivo CSV con formato específico
- Se valida formato y datos antes de importar
- Se muestra preview de usuarios a importar
- Se reportan errores de validación por fila
- Se confirma cantidad de usuarios importados exitosamente
- Se generan contraseñas temporales y se envían por correo

**Prioridad:** Media
**Tiempo Estimado:** 12 horas
**Puntos Estimados:** 8

---

## 📚 MÓDULO DE CURSOS

### Historia #7: Crear y Editar Cursos
**Nombre:** Como docente, quiero crear y editar cursos para organizar mi contenido académico.

**Descripción:**
- **Como:** Docente
- **Quiero:** Crear nuevos cursos con nombre, descripción y configuraciones
- **Para:** Organizar y gestionar mis materias

**Criterios de Aceptación:**
- El docente puede crear cursos con nombre, descripción, turno
- Se puede asignar salón al curso
- Se puede editar información del curso existente
- Se puede activar/desactivar cursos
- Solo el docente propietario puede editar sus cursos

**Prioridad:** Alta
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

### Historia #8: Matricular Estudiantes en Cursos
**Nombre:** Como docente, quiero matricular estudiantes en mis cursos para que puedan acceder al contenido.

**Descripción:**
- **Como:** Docente
- **Quiero:** Agregar estudiantes a mis cursos
- **Para:** Permitirles acceder a tareas y materiales

**Criterios de Aceptación:**
- Búsqueda de estudiantes por nombre o código
- Selección múltiple de estudiantes
- Confirmación de matrícula
- Lista de estudiantes matriculados en el curso
- Posibilidad de desmatricular estudiantes

**Prioridad:** Alta
**Tiempo Estimado:** 6 horas
**Puntos Estimados:** 3

---

### Historia #9: Vista de Detalle de Curso
**Nombre:** Como estudiante, quiero ver el detalle completo de un curso para conocer toda la información relevante.

**Descripción:**
- **Como:** Estudiante
- **Quiero:** Ver información completa del curso (docente, horarios, tareas, materiales)
- **Para:** Tener una visión integral de la materia

**Criterios de Aceptación:**
- Se muestra información del docente
- Se listan todas las tareas del curso
- Se muestran materiales y recursos
- Se visualizan horarios de clase
- Se muestra lista de compañeros matriculados

**Prioridad:** Media
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

### Historia #10: Calendario de Cursos
**Nombre:** Como estudiante, quiero ver un calendario con mis clases para organizar mejor mi tiempo.

**Descripción:**
- **Como:** Estudiante
- **Quiero:** Ver un calendario mensual/semanal con mis clases
- **Para:** Planificar mi estudio y asistencia

**Criterios de Aceptación:**
- Vista de calendario mensual y semanal
- Se muestran clases con horario y salón
- Se pueden ver tareas próximas a vencer
- Se puede filtrar por curso
- Se puede exportar calendario a formato iCal

**Prioridad:** Media
**Tiempo Estimado:** 12 horas
**Puntos Estimados:** 8

---

## 📝 MÓDULO DE TAREAS

### Historia #11: Crear Tarea con Archivos Adjuntos
**Nombre:** Como docente, quiero crear tareas con archivos adjuntos para proporcionar material de apoyo.

**Descripción:**
- **Como:** Docente
- **Quiero:** Crear tareas con posibilidad de adjuntar archivos
- **Para:** Compartir materiales y recursos con los estudiantes

**Criterios de Aceptación:**
- Se puede crear tarea con título, descripción, fecha límite
- Se pueden adjuntar múltiples archivos (PDF, Word, imágenes)
- Se especifica puntos máximos de la tarea
- Se puede asignar a todo el curso o estudiantes específicos
- Se valida tamaño y tipo de archivo

**Prioridad:** Alta
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

### Historia #12: Entregar Tarea con Archivos
**Nombre:** Como estudiante, quiero entregar tareas con archivos adjuntos para completar mis asignaciones.

**Descripción:**
- **Como:** Estudiante
- **Quiero:** Subir archivos al entregar una tarea
- **Para:** Completar mis asignaciones académicas

**Criterios de Aceptación:**
- Se puede subir uno o múltiples archivos
- Se aceptan formatos comunes (PDF, Word, imágenes, etc.)
- Se valida tamaño máximo de archivos
- Se puede agregar comentario junto con la entrega
- Se muestra confirmación de entrega exitosa

**Prioridad:** Alta
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

### Historia #13: Calificar Tareas
**Nombre:** Como docente, quiero calificar tareas de estudiantes para evaluar su desempeño.

**Descripción:**
- **Como:** Docente
- **Quiero:** Revisar entregas y asignar calificaciones con feedback
- **Para:** Evaluar el trabajo de los estudiantes

**Criterios de Aceptación:**
- Se lista todas las entregas de una tarea
- Se puede ver archivos adjuntos de cada entrega
- Se asigna calificación numérica (0-100)
- Se puede agregar feedback escrito
- Se puede marcar como calificado o devolver para corrección
- Se notifica al estudiante cuando se califica

**Prioridad:** Alta
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

### Historia #14: Ver Historial de Tareas
**Nombre:** Como estudiante, quiero ver mi historial completo de tareas para revisar mi progreso.

**Descripción:**
- **Como:** Estudiante
- **Quiero:** Ver todas mis tareas (pendientes, entregadas, calificadas)
- **Para:** Hacer seguimiento de mi trabajo académico

**Criterios de Aceptación:**
- Vista de todas las tareas con filtros (pendiente, entregada, calificada, vencida)
- Se muestra estado, fecha límite, calificación
- Se puede ordenar por fecha, curso, estado
- Se muestra promedio de calificaciones
- Se puede ver detalle de cada tarea

**Prioridad:** Media
**Tiempo Estimado:** 6 horas
**Puntos Estimados:** 3

---

### Historia #15: Plantillas de Tareas
**Nombre:** Como docente, quiero usar plantillas de tareas para crear asignaciones similares más rápido.

**Descripción:**
- **Como:** Docente
- **Quiero:** Guardar tareas como plantillas y reutilizarlas
- **Para:** Ahorrar tiempo al crear tareas recurrentes

**Criterios de Aceptación:**
- Se puede guardar una tarea como plantilla
- Se puede crear nueva tarea desde plantilla
- Se pueden editar plantillas guardadas
- Se puede compartir plantillas con otros docentes
- Se muestra lista de plantillas disponibles

**Prioridad:** Baja
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

## 📊 MÓDULO DE CALIFICACIONES

### Historia #16: Ver Calificaciones por Curso
**Nombre:** Como estudiante, quiero ver mis calificaciones organizadas por curso para evaluar mi desempeño.

**Descripción:**
- **Como:** Estudiante
- **Quiero:** Ver todas mis calificaciones agrupadas por curso
- **Para:** Conocer mi rendimiento en cada materia

**Criterios de Aceptación:**
- Se muestran calificaciones por curso
- Se calcula promedio por curso
- Se muestra gráfico de evolución de calificaciones
- Se puede filtrar por período académico
- Se muestra promedio general

**Prioridad:** Alta
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

### Historia #17: Boletín de Calificaciones
**Nombre:** Como padre de familia, quiero ver el boletín de calificaciones de mi hijo para monitorear su progreso.

**Descripción:**
- **Como:** Padre de familia
- **Quiero:** Acceder al boletín completo de calificaciones de mi hijo
- **Para:** Estar informado sobre su rendimiento académico

**Criterios de Aceptación:**
- Se muestra boletín completo con todas las materias
- Se calculan promedios por curso y general
- Se puede filtrar por período académico
- Se puede exportar boletín en PDF
- Se muestra comparación con promedio del curso

**Prioridad:** Alta
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

### Historia #18: Reporte de Calificaciones para Docente
**Nombre:** Como docente, quiero generar reportes de calificaciones de mi curso para análisis estadístico.

**Descripción:**
- **Como:** Docente
- **Quiero:** Ver estadísticas y reportes de calificaciones de mi curso
- **Para:** Analizar el desempeño general de los estudiantes

**Criterios de Aceptación:**
- Se muestra promedio del curso
- Gráfico de distribución de calificaciones
- Lista de estudiantes con mejor y peor rendimiento
- Se puede exportar reporte en Excel o PDF
- Se muestra tasa de aprobación

**Prioridad:** Media
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

## 💬 MÓDULO DE MENSAJERÍA

### Historia #19: Mensajería en Tiempo Real
**Nombre:** Como usuario, quiero recibir mensajes en tiempo real para comunicarme eficientemente.

**Descripción:**
- **Como:** Usuario de cualquier rol
- **Quiero:** Recibir notificaciones instantáneas de nuevos mensajes
- **Para:** Responder rápidamente a comunicaciones importantes

**Criterios de Aceptación:**
- Notificaciones push cuando llega un mensaje
- Indicador de mensajes no leídos
- Actualización automática de lista de mensajes
- Sonido opcional de notificación
- Se puede desactivar notificaciones

**Prioridad:** Media
**Tiempo Estimado:** 16 horas
**Puntos Estimados:** 8

---

### Historia #20: Enviar Mensaje a Todo el Curso
**Nombre:** Como docente, quiero enviar mensajes a todos los estudiantes de un curso para comunicar anuncios importantes.

**Descripción:**
- **Como:** Docente
- **Quiero:** Enviar un mensaje a todos los estudiantes de un curso
- **Para:** Compartir información relevante con toda la clase

**Criterios de Aceptación:**
- Opción de enviar a todo el curso desde la vista del curso
- Se crea mensaje individual para cada estudiante
- Se puede incluir archivos adjuntos
- Se muestra confirmación de envío
- Los estudiantes reciben el mensaje normalmente

**Prioridad:** Media
**Tiempo Estimado:** 6 horas
**Puntos Estimados:** 3

---

### Historia #21: Filtros y Búsqueda de Mensajes
**Nombre:** Como usuario, quiero buscar y filtrar mis mensajes para encontrar comunicaciones específicas.

**Descripción:**
- **Como:** Usuario de cualquier rol
- **Quiero:** Buscar mensajes por remitente, asunto o contenido
- **Para:** Encontrar rápidamente mensajes importantes

**Criterios de Aceptación:**
- Búsqueda por texto en asunto y contenido
- Filtrado por remitente/destinatario
- Filtrado por fecha
- Filtrado por estado (leído/no leído)
- Filtrado por curso (si aplica)

**Prioridad:** Media
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

## 📚 MÓDULO DE BIBLIOTECA Y CONTENIDOS

### Historia #22: Subir Materiales al Curso
**Nombre:** Como docente, quiero subir materiales educativos a mi curso para compartirlos con estudiantes.

**Descripción:**
- **Como:** Docente
- **Quiero:** Subir documentos, videos, presentaciones a mi curso
- **Para:** Proporcionar recursos de aprendizaje a mis estudiantes

**Criterios de Aceptación:**
- Se pueden subir múltiples tipos de archivos
- Se organizan por carpetas o categorías
- Se puede agregar descripción a cada material
- Solo estudiantes del curso pueden acceder
- Se muestra tamaño y tipo de archivo

**Prioridad:** Alta
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

### Historia #23: Biblioteca de Recursos Compartidos
**Nombre:** Como docente, quiero acceder a una biblioteca de recursos compartidos para enriquecer mis clases.

**Descripción:**
- **Como:** Docente
- **Quiero:** Ver y descargar recursos compartidos por otros docentes
- **Para:** Usar materiales educativos de calidad en mis cursos

**Criterios de Aceptación:**
- Biblioteca central de recursos compartidos
- Búsqueda por categoría, materia, tipo
- Se puede descargar y usar en cursos propios
- Se puede calificar y comentar recursos
- Se muestra autor y fecha de publicación

**Prioridad:** Baja
**Tiempo Estimado:** 12 horas
**Puntos Estimados:** 8

---

### Historia #24: Reproductor de Videos Integrado
**Nombre:** Como estudiante, quiero ver videos educativos directamente en la plataforma para facilitar mi aprendizaje.

**Descripción:**
- **Como:** Estudiante
- **Quiero:** Reproducir videos sin salir de la plataforma
- **Para:** Tener una experiencia de aprendizaje fluida

**Criterios de Aceptación:**
- Reproductor de video integrado
- Soporte para múltiples formatos (MP4, WebM)
- Controles de reproducción (play, pause, volumen, velocidad)
- Se guarda progreso de visualización
- Se puede descargar video si está permitido

**Prioridad:** Media
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

## 🏫 MÓDULO DE SALONES Y HORARIOS

### Historia #25: Gestión de Salones
**Nombre:** Como administrador, quiero gestionar salones para organizar los espacios físicos del colegio.

**Descripción:**
- **Como:** Administrador
- **Quiero:** Crear, editar y eliminar salones con su capacidad
- **Para:** Asignar espacios a cursos y clases

**Criterios de Aceptación:**
- Crear salón con nombre, capacidad, ubicación
- Editar información de salones existentes
- Ver lista de todos los salones
- Ver cursos asignados a cada salón
- Eliminar salones (si no tienen cursos asignados)

**Prioridad:** Media
**Tiempo Estimado:** 6 horas
**Puntos Estimados:** 3

---

### Historia #26: Gestión de Horarios
**Nombre:** Como administrador, quiero crear y gestionar horarios de clases para organizar el tiempo académico.

**Descripción:**
- **Como:** Administrador
- **Quiero:** Asignar horarios a cursos con día, hora y salón
- **Para:** Organizar el calendario académico del colegio

**Criterios de Aceptación:**
- Crear horario con curso, día, hora inicio, hora fin, salón
- Validar que no haya conflictos de horario
- Ver horario completo del colegio
- Editar y eliminar horarios
- Exportar horario en formato PDF

**Prioridad:** Alta
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

## 🔔 MÓDULO DE NOTIFICACIONES

### Historia #27: Centro de Notificaciones
**Nombre:** Como usuario, quiero ver todas mis notificaciones en un centro centralizado para estar al día.

**Descripción:**
- **Como:** Usuario de cualquier rol
- **Quiero:** Ver todas mis notificaciones en un panel
- **Para:** No perder información importante

**Criterios de Aceptación:**
- Panel de notificaciones con todas las alertas
- Notificaciones de tareas, mensajes, calificaciones
- Marcar como leída/no leída
- Eliminar notificaciones
- Contador de no leídas

**Prioridad:** Alta
**Tiempo Estimado:** 8 horas
**Puntos Estimados:** 5

---

### Historia #28: Configuración de Notificaciones
**Nombre:** Como usuario, quiero configurar qué notificaciones recibir para personalizar mi experiencia.

**Descripción:**
- **Como:** Usuario de cualquier rol
- **Quiero:** Elegir qué tipos de notificaciones recibir
- **Para:** Controlar la cantidad de alertas que recibo

**Criterios de Aceptación:**
- Configuración por tipo de notificación
- Opción de recibir por correo, push, o ambas
- Horarios de silencio configurable
- Se guardan preferencias del usuario
- Se puede desactivar todas las notificaciones

**Prioridad:** Media
**Tiempo Estimado:** 6 horas
**Puntos Estimados:** 3

---

## 📱 MÓDULO DE REPORTES Y ANALYTICS

### Historia #29: Dashboard de Estadísticas para Administrador
**Nombre:** Como administrador, quiero ver estadísticas generales de la plataforma para tomar decisiones informadas.

**Descripción:**
- **Como:** Administrador
- **Quiero:** Ver métricas y estadísticas del sistema
- **Para:** Monitorear el uso y rendimiento de la plataforma

**Criterios de Aceptación:**
- Gráficos de usuarios activos por rol
- Estadísticas de cursos y tareas
- Métricas de uso de la plataforma
- Gráficos de calificaciones promedio
- Exportación de reportes

**Prioridad:** Media
**Tiempo Estimado:** 12 horas
**Puntos Estimados:** 8

---

### Historia #30: Reporte de Asistencia
**Nombre:** Como docente, quiero registrar y ver reportes de asistencia de mis estudiantes para llevar control.

**Descripción:**
- **Como:** Docente
- **Quiero:** Marcar asistencia de estudiantes y generar reportes
- **Para:** Llevar control de la participación en clases

**Criterios de Aceptación:**
- Marcar asistencia por clase (presente, ausente, justificado)
- Ver historial de asistencia por estudiante
- Generar reporte de asistencia del curso
- Calcular porcentaje de asistencia
- Exportar reporte en Excel o PDF

**Prioridad:** Baja
**Tiempo Estimado:** 10 horas
**Puntos Estimados:** 5

---

## 📊 RESUMEN DE PRIORIDADES

### Prioridad Alta (12 historias)
- Historias #1, #4, #5, #7, #8, #11, #12, #13, #16, #17, #22, #26, #27

### Prioridad Media (13 historias)
- Historias #2, #3, #6, #9, #10, #14, #18, #19, #20, #21, #24, #25, #28, #29

### Prioridad Baja (5 historias)
- Historias #15, #23, #30

---

## 📈 ESTIMACIONES TOTALES

- **Total de Horas Estimadas:** 294 horas
- **Total de Puntos Estimados:** 158 puntos
- **Promedio de Horas por Historia:** 9.8 horas
- **Promedio de Puntos por Historia:** 5.3 puntos

---

## 📝 NOTAS

- Las estimaciones están basadas en desarrollo full-stack (frontend + backend)
- Los tiempos incluyen diseño, desarrollo, testing y documentación
- Los puntos siguen la escala de Fibonacci modificada (1, 2, 3, 5, 8)
- Las prioridades pueden ajustarse según necesidades del negocio
- Se recomienda implementar las historias de prioridad alta primero

---

**Documento creado:** 2024
**Versión:** 1.0

