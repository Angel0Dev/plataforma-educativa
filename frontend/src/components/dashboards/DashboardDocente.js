import React, { useState, useEffect } from 'react';

const DashboardDocente = ({ user }) => {
    const [cursos, setCursos] = useState([]);
    const [salones, setSalones] = useState([]);
    const [todosSalones, setTodosSalones] = useState([]); // Todos los salones disponibles para seleccionar en horarios
    const [estudiantes, setEstudiantes] = useState([]);
    const [estudiantesSalon, setEstudiantesSalon] = useState([]);
    const [tareas, setTareas] = useState([]);
    const [entregas, setEntregas] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMensajeModal, setShowMensajeModal] = useState(false);
    const [showEstudiantesModal, setShowEstudiantesModal] = useState(false);
    const [showEstudiantesSalonModal, setShowEstudiantesSalonModal] = useState(false);
    const [showCrearTarea, setShowCrearTarea] = useState(false);
    const [showCalificaciones, setShowCalificaciones] = useState(false);
    const [salonSeleccionado, setSalonSeleccionado] = useState(null);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [nuevaTarea, setNuevaTarea] = useState({
        titulo: '',
        descripcion: '',
        fecha_limite: '',
        puntos_maximos: 100,
        id_curso: ''
    });
    const [calificacionEdit, setCalificacionEdit] = useState({
        id_entrega: null,
        calificacion: '',
        feedback: ''
    });
    const [nuevoMensaje, setNuevoMensaje] = useState({
        destinatario: '',
        asunto: '',
        contenido: '',
        id_curso: null
    });
    // Estados para gestión de horarios
    const [showHorariosCurso, setShowHorariosCurso] = useState(false);
    const [cursoSeleccionadoHorarios, setCursoSeleccionadoHorarios] = useState(null);
    const [horariosCurso, setHorariosCurso] = useState([]);
    const [showAgregarHorario, setShowAgregarHorario] = useState(false);
    const [nuevoHorario, setNuevoHorario] = useState({
        id_curso: null,
        id_docente: '',
        id_salon: '',
        dia_semana: '',
        hora_inicio: '',
        hora_fin: '',
        turno: ''
    });
    const [showEditarHorario, setShowEditarHorario] = useState(false);
    const [horarioEditando, setHorarioEditando] = useState(null);
    // Estados para asignarse a cursos
    const [showCursosDisponibles, setShowCursosDisponibles] = useState(false);
    const [cursosDisponibles, setCursosDisponibles] = useState([]);
    // Estados para evaluación de tareas
    const [showEvaluacionTarea, setShowEvaluacionTarea] = useState(false);
    const [tareaEvaluacion, setTareaEvaluacion] = useState(null);
    const [estudiantesConEntregas, setEstudiantesConEntregas] = useState([]);
    const [calificacionesEditando, setCalificacionesEditando] = useState({});
    // Estados para mensajería mejorada
    const [estudiantesConPadres, setEstudiantesConPadres] = useState([]);
    const [tipoDestinatario, setTipoDestinatario] = useState('curso'); // 'curso' o 'general'
    const [usuariosGenerales, setUsuariosGenerales] = useState([]);

    // Cargar datos del docente
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                
                // Cargar cursos del docente
                const cursosResponse = await fetch(`http://localhost:5000/api/cursos/docente/${user.id}`);
                if (cursosResponse.ok) {
                    const cursosData = await cursosResponse.json();
                    setCursos(cursosData.data);
                }

                // Cargar salones del docente
                const salonesResponse = await fetch(`http://localhost:5000/api/salones/docente/${user.id}`);
                if (salonesResponse.ok) {
                    const salonesData = await salonesResponse.json();
                    setSalones(salonesData.data);
                }

                // Cargar todos los salones disponibles (para seleccionar en horarios)
                const todosSalonesResponse = await fetch('http://localhost:5000/api/salones');
                if (todosSalonesResponse.ok) {
                    const todosSalonesData = await todosSalonesResponse.json();
                    setTodosSalones(todosSalonesData.data || []);
                }

                // Cargar mensajes del docente
                const mensajesResponse = await fetch(`http://localhost:5000/api/mensajes/usuario/${user.id}?tipo=recibidos`);
                if (mensajesResponse.ok) {
                    const mensajesData = await mensajesResponse.json();
                    setMensajes(mensajesData.data.slice(0, 5)); // Solo los últimos 5
                }

                // Cargar todos los cursos disponibles
                const cursosDisponiblesResponse = await fetch('http://localhost:5000/api/cursos');
                if (cursosDisponiblesResponse.ok) {
                    const cursosDisponiblesData = await cursosDisponiblesResponse.json();
                    setCursosDisponibles(cursosDisponiblesData.data || []);
                }

                setError(null);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setError('Error al cargar los datos del dashboard');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [user.id]);

    // Escuchar eventos del sidebar
    useEffect(() => {
        const handleDashboardAction = (event) => {
            const { action } = event.detail;
            switch (action) {
                case 'cursos':
                    // Scroll a la sección de cursos
                    const cursosSection = document.querySelector('.dashboard-section');
                    if (cursosSection) {
                        cursosSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    break;
                case 'salones':
                    // Scroll a la sección de salones
                    const salonesSection = document.querySelector('.dashboard-card');
                    if (salonesSection) {
                        salonesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    break;
                case 'tareas':
                    // Abrir modal de tareas o scroll
                    alert('Funcionalidad de tareas');
                    break;
                case 'horarios':
                    // Abrir modal de horarios
                    alert('Funcionalidad de horarios');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('dashboard-action', handleDashboardAction);
        return () => window.removeEventListener('dashboard-action', handleDashboardAction);
    }, []);

    // Cargar estudiantes de un curso específico
    const cargarEstudiantes = async (idCurso) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cursos/${idCurso}/estudiantes`);
            if (response.ok) {
                const data = await response.json();
                setEstudiantes(data.data);
                setCursoSeleccionado(cursos.find(c => c.id_curso === idCurso));
                setShowEstudiantesModal(true);
            }
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            alert('Error al cargar los estudiantes del curso');
        }
    };

    // Cargar estudiantes de un salón
    const cargarEstudiantesSalon = async (idSalon) => {
        try {
            const response = await fetch(`http://localhost:5000/api/salones/${idSalon}`);
            if (response.ok) {
                const data = await response.json();
                setEstudiantesSalon(data.data.estudiantes || []);
                setSalonSeleccionado(data.data.salon);
                setShowEstudiantesSalonModal(true);
            }
        } catch (error) {
            console.error('Error al cargar estudiantes del salón:', error);
            alert('Error al cargar los estudiantes del salón');
        }
    };

    // Cargar tareas de un curso
    const cargarTareas = async (idCurso) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cursos/${idCurso}/tareas`);
            if (response.ok) {
                const data = await response.json();
                setTareas(data.data || []);
                setShowCalificaciones(true);
            }
        } catch (error) {
            console.error('Error al cargar tareas:', error);
        }
    };

    // Función para determinar el estado de una tarea
    const getEstadoTarea = (fechaLimite) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const limite = new Date(fechaLimite);
        limite.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return { estado: 'En evaluación', color: '#ff9800', puedeEvaluar: true };
        } else if (diasRestantes === 0) {
            return { estado: 'En evaluación', color: '#ff9800', puedeEvaluar: true };
        } else if (diasRestantes <= 3) {
            return { estado: 'Próxima', color: '#dc3545', puedeEvaluar: false };
        } else {
            return { estado: 'Activa', color: '#28a745', puedeEvaluar: false };
        }
    };

    // Cargar estudiantes con entregas para evaluar una tarea
    const cargarEstudiantesParaEvaluar = async (idTarea) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tareas/${idTarea}/estudiantes-con-entregas`);
            if (response.ok) {
                const data = await response.json();
                setTareaEvaluacion(data.data.tarea);
                setEstudiantesConEntregas(data.data.estudiantes || []);
                
                // Inicializar calificaciones editando
                const calificacionesIniciales = {};
                data.data.estudiantes.forEach(est => {
                    calificacionesIniciales[est.id_usuario] = {
                        id_entrega: est.id_entrega || null,
                        calificacion: est.calificacion || '',
                        feedback: est.feedback_docente || ''
                    };
                });
                setCalificacionesEditando(calificacionesIniciales);
                
                setShowEvaluacionTarea(true);
            } else {
                alert('Error al cargar estudiantes para evaluación');
            }
        } catch (error) {
            console.error('Error al cargar estudiantes para evaluar:', error);
            alert('Error de conexión');
        }
    };

    // Guardar calificación de un estudiante
    const guardarCalificacion = async (idEstudiante, idTarea) => {
        const calificacionData = calificacionesEditando[idEstudiante];
        
        if (!calificacionData || !calificacionData.calificacion) {
            alert('Debe ingresar una calificación');
            return;
        }

        const calificacion = parseFloat(calificacionData.calificacion);
        if (isNaN(calificacion) || calificacion < 0 || calificacion > 20) {
            alert('La calificación debe ser un número entre 0 y 20');
            return;
        }

        try {
            // Si ya existe una entrega, actualizar la calificación
            if (calificacionData.id_entrega) {
                const response = await fetch(`http://localhost:5000/api/tareas/entregas/${calificacionData.id_entrega}/calificar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        calificacion: calificacion,
                        feedback_docente: calificacionData.feedback || null
                    }),
                });

                if (response.ok) {
                    alert('Calificación guardada exitosamente');
                    await cargarEstudiantesParaEvaluar(idTarea);
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.message}`);
                }
            } else {
                // Si no hay entrega, crear una entrega con calificación (para estudiantes que no entregaron pero se les puede calificar)
                // Primero necesitamos crear la entrega
                const crearEntregaResponse = await fetch('http://localhost:5000/api/tareas/entregas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_tarea: idTarea,
                        id_estudiante: idEstudiante,
                        archivo_adjunto: null,
                        comentario: 'Calificación sin entrega'
                    }),
                });

                if (crearEntregaResponse.ok) {
                    const entregaData = await crearEntregaResponse.json();
                    // Ahora calificar la entrega recién creada
                    const calificarResponse = await fetch(`http://localhost:5000/api/tareas/entregas/${entregaData.data.id_entrega}/calificar`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            calificacion: calificacion,
                            feedback_docente: calificacionData.feedback || null
                        }),
                    });

                    if (calificarResponse.ok) {
                        alert('Calificación guardada exitosamente');
                        await cargarEstudiantesParaEvaluar(idTarea);
                    } else {
                        const error = await calificarResponse.json();
                        alert(`Error: ${error.message}`);
                    }
                } else {
                    const error = await crearEntregaResponse.json();
                    alert(`Error al crear entrega: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('Error al guardar calificación:', error);
            alert('Error de conexión');
        }
    };

    // Crear nueva tarea
    const crearTarea = async (e) => {
        e.preventDefault();
        
        if (!nuevaTarea.titulo || !nuevaTarea.fecha_limite || !nuevaTarea.id_curso) {
            alert('Título, fecha límite y curso son obligatorios');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/tareas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_curso: parseInt(nuevaTarea.id_curso),
                    titulo: nuevaTarea.titulo,
                    descripcion: nuevaTarea.descripcion || null,
                    fecha_limite: nuevaTarea.fecha_limite,
                    puntos_maximos: parseFloat(nuevaTarea.puntos_maximos) || 100
                }),
            });

            if (response.ok) {
                alert('Tarea creada exitosamente');
                setNuevaTarea({ titulo: '', descripcion: '', fecha_limite: '', puntos_maximos: 100, id_curso: '' });
                setShowCrearTarea(false);
                
                // Recargar tareas del curso
                if (nuevaTarea.id_curso) {
                    cargarTareas(parseInt(nuevaTarea.id_curso));
                }
            } else {
                const error = await response.json();
                alert(`Error al crear tarea: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear tarea:', error);
            alert('Error de conexión al crear la tarea');
        }
    };

    // Cargar entregas de una tarea
    const cargarEntregas = async (idTarea) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tareas/${idTarea}/entregas`);
            if (response.ok) {
                const data = await response.json();
                setEntregas(data.data || []);
                setTareaSeleccionada(idTarea);
            } else {
                alert('No se pudieron cargar las entregas');
            }
        } catch (error) {
            console.error('Error al cargar entregas:', error);
            alert('Error al cargar las entregas');
        }
    };

    // Actualizar calificación
    const actualizarCalificacion = async (e) => {
        e.preventDefault();
        
        if (!calificacionEdit.id_entrega || !calificacionEdit.calificacion) {
            alert('Calificación es obligatoria');
            return;
        }

        const calificacion = parseFloat(calificacionEdit.calificacion);
        if (calificacion < 0 || calificacion > 20) {
            alert('La calificación debe estar entre 0 y 20');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/tareas/entregas/${calificacionEdit.id_entrega}/calificar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    calificacion: calificacion,
                    feedback_docente: calificacionEdit.feedback || null
                }),
            });

            if (response.ok) {
                alert('Calificación actualizada exitosamente');
                setCalificacionEdit({ id_entrega: null, calificacion: '', feedback: '' });
                
                // Recargar entregas
                if (tareaSeleccionada) {
                    cargarEntregas(tareaSeleccionada);
                }
            } else {
                const error = await response.json();
                alert(`Error al actualizar calificación: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al actualizar calificación:', error);
            alert('Error de conexión al actualizar la calificación');
        }
    };

    // Función para cargar horarios de un curso
    const cargarHorariosCurso = async (idCurso) => {
        try {
            const response = await fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/horarios`);
            if (response.ok) {
                const data = await response.json();
                // Filtrar solo los horarios del docente actual
                const horariosDelDocente = (data.data || []).filter(h => h.id_docente === user.id);
                setHorariosCurso(horariosDelDocente);
            }
        } catch (error) {
            console.error('Error al cargar horarios:', error);
        }
    };

    // Función para crear horario
    const crearHorario = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/horarios/horarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_curso: nuevoHorario.id_curso,
                    id_docente: user.id, // Siempre usar el ID del docente actual
                    id_salon: nuevoHorario.id_salon ? parseInt(nuevoHorario.id_salon) : null,
                    dia_semana: nuevoHorario.dia_semana,
                    hora_inicio: nuevoHorario.hora_inicio,
                    hora_fin: nuevoHorario.hora_fin,
                    turno: nuevoHorario.turno || null
                }),
            });

            if (response.ok) {
                alert('Horario creado exitosamente');
                setNuevoHorario({
                    id_curso: null,
                    id_docente: '',
                    id_salon: '',
                    dia_semana: '',
                    hora_inicio: '',
                    hora_fin: '',
                    turno: ''
                });
                setShowAgregarHorario(false);
                if (cursoSeleccionadoHorarios) {
                    await cargarHorariosCurso(cursoSeleccionadoHorarios.id_curso);
                }
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear horario:', error);
            alert('Error de conexión');
        }
    };

    // Función para actualizar horario
    const actualizarHorario = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/horarios/horarios/${horarioEditando.id_horario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_curso: horarioEditando.id_curso,
                    id_docente: user.id, // Siempre usar el ID del docente actual
                    id_salon: horarioEditando.id_salon ? parseInt(horarioEditando.id_salon) : null,
                    dia_semana: horarioEditando.dia_semana,
                    hora_inicio: horarioEditando.hora_inicio,
                    hora_fin: horarioEditando.hora_fin,
                    turno: horarioEditando.turno || null
                }),
            });

            if (response.ok) {
                alert('Horario actualizado exitosamente');
                setShowEditarHorario(false);
                setHorarioEditando(null);
                if (cursoSeleccionadoHorarios) {
                    await cargarHorariosCurso(cursoSeleccionadoHorarios.id_curso);
                }
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al actualizar horario:', error);
            alert('Error de conexión');
        }
    };

    // Función para eliminar horario
    const eliminarHorario = async (idHorario, idCurso) => {
        if (!window.confirm('¿Está seguro de eliminar este horario?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/horarios/horarios/${idHorario}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await cargarHorariosCurso(idCurso);
                alert('Horario eliminado exitosamente');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            alert('Error de conexión');
        }
    };

    // Función para asignarse a un curso
    const asignarseACurso = async (idCurso) => {
        try {
            const response = await fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/docentes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_docente: user.id }),
            });

            if (response.ok) {
                alert('Te has asignado al curso exitosamente');
                // Recargar cursos del docente
                const cursosResponse = await fetch(`http://localhost:5000/api/cursos/docente/${user.id}`);
                if (cursosResponse.ok) {
                    const cursosData = await cursosResponse.json();
                    setCursos(cursosData.data);
                }
                // Actualizar lista de cursos disponibles
                const cursosDisponiblesResponse = await fetch('http://localhost:5000/api/cursos');
                if (cursosDisponiblesResponse.ok) {
                    const cursosDisponiblesData = await cursosDisponiblesResponse.json();
                    setCursosDisponibles(cursosDisponiblesData.data || []);
                }
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al asignarse al curso:', error);
            alert('Error de conexión');
        }
    };

    // Cargar estudiantes con padres de un curso
    const cargarEstudiantesConPadres = async (idCurso) => {
        if (!idCurso) {
            console.warn('No se proporcionó ID de curso');
            setEstudiantesConPadres([]);
            return;
        }
        
        try {
            setLoading(true);
            console.log('Cargando estudiantes para el curso:', idCurso);
            const response = await fetch(`http://localhost:5000/api/cursos/${idCurso}/estudiantes-con-padres`);
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos del backend:', data);
                
                // Verificar la estructura de la respuesta
                if (data.success && Array.isArray(data.data)) {
                    const estudiantes = data.data;
                    console.log('Estudiantes procesados:', estudiantes.length, estudiantes);
                    setEstudiantesConPadres(estudiantes);
                    
                    if (estudiantes.length === 0) {
                        console.warn('El curso no tiene estudiantes matriculados');
                    }
                } else {
                    console.error('Estructura de respuesta inválida:', data);
                    setEstudiantesConPadres([]);
                }
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                console.error('Error en la respuesta del servidor:', errorData);
                alert(`Error al cargar estudiantes: ${errorData.message || 'Error desconocido'}`);
                setEstudiantesConPadres([]);
            }
        } catch (error) {
            console.error('Error al cargar estudiantes con padres:', error);
            alert(`Error de conexión: ${error.message}`);
            setEstudiantesConPadres([]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar usuarios generales (docentes, padres, etc.)
    const cargarUsuariosGenerales = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/usuarios');
            if (response.ok) {
                const data = await response.json();
                // Filtrar solo docentes y padres, excluyendo al usuario actual
                const usuariosFiltrados = (data.data || []).filter(u => 
                    (u.rol === 'Docente' || u.rol === 'Padre') && 
                    u.id_usuario !== user.id &&
                    u.activo === true
                );
                setUsuariosGenerales(usuariosFiltrados);
            }
        } catch (error) {
            console.error('Error al cargar usuarios generales:', error);
        }
    };

    // Enviar mensaje
    const enviarMensaje = async (e) => {
        e.preventDefault();
        
        if (!nuevoMensaje.destinatario) {
            alert('Debe seleccionar un destinatario');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/mensajes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_remitente: user.id,
                    id_destinatario: parseInt(nuevoMensaje.destinatario),
                    asunto: nuevoMensaje.asunto || 'Sin asunto',
                    contenido: nuevoMensaje.contenido
                }),
            });

            if (response.ok) {
                alert('Mensaje enviado exitosamente');
                setNuevoMensaje({ destinatario: '', asunto: '', contenido: '', id_curso: null });
                setTipoDestinatario('curso');
                setEstudiantesConPadres([]);
                setShowMensajeModal(false);
            } else {
                const error = await response.json();
                alert(`Error al enviar mensaje: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error de conexión al enviar el mensaje');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-error">
                    <h3>Error al cargar datos</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        Recargar Página
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header del Dashboard */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard Docente</h1>
                    <p className="dashboard-subtitle">Panel de control para profesores</p>
                </div>
                <div className="user-info">
                    <p className="user-name">{user.nombre} {user.apellido}</p>
                    <p className="user-role">👨‍🏫 Docente</p>
                </div>
            </div>

            {/* Mis Salones */}
            {salones.length > 0 && (
                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">🏫</div>
                        <h3 className="card-title">Mis Salones</h3>
                    </div>
                    <div className="card-content">
                        <div className="salones-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                            {salones.map(salon => (
                                <div key={salon.id_salon} className="salon-item" style={{ 
                                    padding: '15px', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '8px',
                                    backgroundColor: salon.activo ? '#fff' : '#f5f5f5',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{salon.nombre_salon}</h4>
                                        {salon.grado && salon.seccion && (
                                            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                                {salon.grado} {salon.seccion}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ 
                                        padding: '10px', 
                                        backgroundColor: salon.cupos_disponibles > 0 ? '#d4edda' : '#f8d7da',
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        marginBottom: '10px'
                                    }}>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>
                                            {salon.estudiantes_matriculados || 0} / {salon.capacidad_maxima}
                                        </p>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                            {salon.cupos_disponibles || salon.capacidad_maxima} cupos disponibles
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => cargarEstudiantesSalon(salon.id_salon)}
                                        >
                                            Ver Estudiantes
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Estadísticas Rápidas */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📚</div>
                        <h3 className="card-title">Cursos Activos</h3>
                    </div>
                    <div className="card-content">
                        <div className="stat-number">{cursos.length}</div>
                        <p className="stat-description">Cursos asignados</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">👥</div>
                        <h3 className="card-title">Total Estudiantes</h3>
                    </div>
                    <div className="card-content">
                        <div className="stat-number">
                            {Math.floor(cursos.reduce((total, curso) => total + (Number(curso.estudiantes_activos) || 0), 0))}
                        </div>
                        <p className="stat-description">Estudiantes activos</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📧</div>
                        <h3 className="card-title">Mensajes</h3>
                    </div>
                    <div className="card-content">
                        <div className="stat-number">{mensajes.length}</div>
                        <p className="stat-description">Mensajes recientes</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📊</div>
                        <h3 className="card-title">Promedio</h3>
                    </div>
                    <div className="card-content">
                        <div className="stat-number">85%</div>
                        <p className="stat-description">Progreso general</p>
                    </div>
                </div>
            </div>

            {/* Cursos Impartidos */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Mis Cursos</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="btn-secondary"
                            onClick={() => setShowCursosDisponibles(true)}
                        >
                            ➕ Asignarse a Curso
                        </button>
                    <button 
                        className="btn-primary"
                            onClick={async () => {
                                setNuevoMensaje({ destinatario: '', asunto: '', contenido: '', id_curso: null });
                                setTipoDestinatario('general');
                                await cargarUsuariosGenerales();
                                setShowMensajeModal(true);
                            }}
                    >
                        📧 Enviar Mensaje
                    </button>
                    </div>
                </div>
                
                <div className="courses-grid">
                    {cursos.length > 0 ? (
                        cursos.map(curso => (
                            <div key={curso.id_curso} className="course-card">
                                <div className="course-header">
                                    <h3 className="course-title">{curso.nombre_curso}</h3>
                                    <span className="course-status active">Activo</span>
                                </div>
                                <div className="course-info">
                                    <p className="course-description">{curso.descripcion || 'Sin descripción'}</p>
                                    {curso.turno && (
                                        <p style={{ color: '#007bff', fontWeight: 'bold', margin: '5px 0' }}>
                                            Turno: {curso.turno}
                                        </p>
                                    )}
                                    <div className="course-stats">
                                        <div className="stat">
                                            <span className="stat-label">Estudiantes:</span>
                                            <span className="stat-value">{Math.floor(Number(curso.estudiantes_activos) || 0)}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Total:</span>
                                            <span className="stat-value">{Math.floor(Number(curso.total_estudiantes) || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="course-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => cargarEstudiantes(curso.id_curso)}
                                    >
                                        👥 Ver Estudiantes
                                    </button>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => {
                                            setNuevaTarea(prev => ({ ...prev, id_curso: curso.id_curso.toString() }));
                                            setShowCrearTarea(true);
                                        }}
                                    >
                                        ➕ Crear Tarea
                                    </button>
                                    <button 
                                        className="btn-primary"
                                        onClick={async () => {
                                            // Cargar tareas del curso
                                            const tareasResponse = await fetch(`http://localhost:5000/api/cursos/${curso.id_curso}/tareas`);
                                            if (tareasResponse.ok) {
                                                const tareasData = await tareasResponse.json();
                                                setTareas(tareasData.data || []);
                                                setCursoSeleccionado(curso);
                                                setShowCalificaciones(true);
                                            }
                                        }}
                                    >
                                        📝 Ver Tareas
                                    </button>
                                    <button 
                                        className="btn-primary"
                                        onClick={async () => {
                                            setCursoSeleccionadoHorarios(curso);
                                            await cargarHorariosCurso(curso.id_curso);
                                            setShowHorariosCurso(true);
                                        }}
                                    >
                                        📅 Gestionar Horarios
                                    </button>
                                    <button 
                                        className="btn-secondary"
                                        onClick={async () => {
                                            setNuevoMensaje(prev => ({ ...prev, id_curso: curso.id_curso }));
                                            setTipoDestinatario('curso');
                                            await cargarEstudiantesConPadres(curso.id_curso);
                                            setShowMensajeModal(true);
                                        }}
                                    >
                                        📧 Mensaje al Curso
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">
                            <p>No tienes cursos asignados actualmente.</p>
                    </div>
                    )}
                </div>
            </div>

            {/* Mensajes Recientes */}
            <div className="dashboard-section">
                <h2 className="section-title">Mensajes Recientes</h2>
                <div className="messages-list">
                    {mensajes.length > 0 ? (
                        mensajes.map(mensaje => (
                            <div key={mensaje.id_mensaje} className="message-item">
                                <div className="message-header">
                                    <h4 className="message-sender">
                                        {mensaje.remitente_nombre} {mensaje.remitente_apellido}
                                    </h4>
                                    <span className="message-date">
                                        {new Date(mensaje.fecha_envio).toLocaleDateString()}
                                    </span>
                                </div>
                                <h5 className="message-subject">{mensaje.asunto || 'Sin asunto'}</h5>
                                <p className="message-content">{mensaje.contenido}</p>
                                {mensaje.nombre_curso && (
                                    <span className="message-course">Curso: {mensaje.nombre_curso}</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-data">
                            <p>No tienes mensajes recientes.</p>
                    </div>
                    )}
                </div>
            </div>

            {/* Modal para Enviar Mensaje */}
            {showMensajeModal && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Enviar Mensaje</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowMensajeModal(false);
                                    setNuevoMensaje({ destinatario: '', asunto: '', contenido: '', id_curso: null });
                                    setTipoDestinatario('curso');
                                    setEstudiantesConPadres([]);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={enviarMensaje} className="modal-content">
                            {/* Selector de tipo de destinatario */}
                            <div className="form-group">
                                <label>Tipo de Mensaje:</label>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <button
                                        type="button"
                                        className={tipoDestinatario === 'curso' ? 'btn-primary' : 'btn-secondary'}
                                        onClick={async () => {
                                            setTipoDestinatario('curso');
                                            if (nuevoMensaje.id_curso) {
                                                await cargarEstudiantesConPadres(nuevoMensaje.id_curso);
                                            }
                                        }}
                                    >
                                        📚 Estudiantes del Curso
                                    </button>
                                    <button
                                        type="button"
                                        className={tipoDestinatario === 'general' ? 'btn-primary' : 'btn-secondary'}
                                        onClick={async () => {
                                            setTipoDestinatario('general');
                                            await cargarUsuariosGenerales();
                                        }}
                                    >
                                        👥 General (Docentes, Padres)
                                    </button>
                                </div>
                            </div>

                            {/* Selector de destinatario según el tipo */}
                            <div className="form-group">
                                <label>Destinatario: *</label>
                                {tipoDestinatario === 'curso' ? (
                                    <div>
                                        {nuevoMensaje.id_curso ? (
                                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                                                {loading ? (
                                                    <p style={{ color: '#666', textAlign: 'center' }}>Cargando estudiantes...</p>
                                                ) : estudiantesConPadres.length > 0 ? (
                                                    estudiantesConPadres.map(estudiante => (
                                                        <div key={estudiante.id_usuario} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                                                            <div style={{ marginBottom: '10px' }}>
                                                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input 
                                                                        type="radio"
                                                                        name="destinatario"
                                                                        value={estudiante.id_usuario}
                                                                        checked={nuevoMensaje.destinatario === estudiante.id_usuario.toString()}
                                    onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatario: e.target.value})}
                                                                        style={{ marginRight: '10px' }}
                                />
                                                                    <strong>👨‍🎓 {estudiante.nombre} {estudiante.apellido}</strong>
                                                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>(Estudiante)</span>
                                                                </label>
                </div>
                                                            {estudiante.padres && estudiante.padres.length > 0 && (
                                                                <div style={{ marginLeft: '30px' }}>
                                                                    {estudiante.padres.map(padre => (
                                                                        <label key={padre.id_usuario} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '5px' }}>
                                                                            <input
                                                                                type="radio"
                                                                                name="destinatario"
                                                                                value={padre.id_usuario}
                                                                                checked={nuevoMensaje.destinatario === padre.id_usuario.toString()}
                                                                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatario: e.target.value})}
                                                                                style={{ marginRight: '10px' }}
                                                                            />
                                                                            <span>👨‍👩‍👧‍👦 {padre.nombre} {padre.apellido}</span>
                                                                            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>({padre.relacion})</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ padding: '20px', textAlign: 'center' }}>
                                                        <p style={{ color: '#dc3545', marginBottom: '10px', fontWeight: 'bold' }}>⚠️ No se encontraron estudiantes</p>
                                                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                                                            No hay estudiantes matriculados en este curso o no se pudieron cargar los datos.
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className="btn-secondary"
                                                            onClick={async () => {
                                                                if (nuevoMensaje.id_curso) {
                                                                    await cargarEstudiantesConPadres(nuevoMensaje.id_curso);
                                                                }
                                                            }}
                                                            style={{ marginTop: '10px' }}
                                                        >
                                                            🔄 Reintentar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#666' }}>Selecciona un curso primero desde "Mensaje al Curso"</p>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                                        {usuariosGenerales.length > 0 ? (
                                            usuariosGenerales.map(usuario => (
                                                <label key={usuario.id_usuario} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                                                    <input
                                                        type="radio"
                                                        name="destinatario"
                                                        value={usuario.id_usuario}
                                                        checked={nuevoMensaje.destinatario === usuario.id_usuario.toString()}
                                                        onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatario: e.target.value})}
                                                        style={{ marginRight: '10px' }}
                                                    />
                                                    <div>
                                                        <strong>{usuario.nombre} {usuario.apellido}</strong>
                                                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                                                            ({usuario.rol})
                                                        </span>
                                                        <div style={{ fontSize: '12px', color: '#999' }}>{usuario.correo}</div>
                                                    </div>
                                                </label>
                                            ))
                                        ) : (
                                            <p style={{ color: '#666', textAlign: 'center' }}>Cargando usuarios...</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Asunto:</label>
                                <input 
                                    type="text" 
                                    value={nuevoMensaje.asunto}
                                    onChange={(e) => setNuevoMensaje({...nuevoMensaje, asunto: e.target.value})}
                                    placeholder="Asunto del mensaje"
                                />
                                </div>
                            <div className="form-group">
                                <label>Mensaje: *</label>
                                <textarea 
                                    value={nuevoMensaje.contenido}
                                    onChange={(e) => setNuevoMensaje({...nuevoMensaje, contenido: e.target.value})}
                                    placeholder="Escribe tu mensaje aquí..."
                                    rows="4"
                                    required
                                />
                                </div>
                            {nuevoMensaje.id_curso && (
                                <p style={{ padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px', color: '#666' }}>
                                    📚 Curso: {cursos.find(c => c.id_curso === nuevoMensaje.id_curso)?.nombre_curso}
                                </p>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowMensajeModal(false);
                                    setNuevoMensaje({ destinatario: '', asunto: '', contenido: '', id_curso: null });
                                    setTipoDestinatario('curso');
                                    setEstudiantesConPadres([]);
                                }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Enviar Mensaje
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Ver Estudiantes */}
            {showEstudiantesModal && cursoSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Estudiantes - {cursoSeleccionado.nombre_curso}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowEstudiantesModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="students-list">
                                {estudiantes.length > 0 ? (
                                    estudiantes.map(estudiante => (
                                        <div key={estudiante.id_usuario} className="student-item">
                                            <div className="student-info">
                                                <h4>{estudiante.nombre} {estudiante.apellido}</h4>
                                                <p>{estudiante.correo}</p>
                                                <span className={`status ${estudiante.estado_matricula.toLowerCase()}`}>
                                                    {estudiante.estado_matricula}
                                                </span>
                                            </div>
                                            <button 
                                                className="btn-primary"
                                                onClick={() => {
                                                    setNuevoMensaje({
                                                        destinatario: estudiante.id_usuario,
                                                        asunto: `Mensaje sobre ${cursoSeleccionado.nombre_curso}`,
                                                        contenido: '',
                                                        id_curso: cursoSeleccionado.id_curso
                                                    });
                                                    setShowEstudiantesModal(false);
                                                    setShowMensajeModal(true);
                                                }}
                                            >
                                                📧 Enviar Mensaje
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data">
                                        <p>No hay estudiantes matriculados en este curso.</p>
                                    </div>
                                )}
                            </div>
                </div>
                    </div>
                </div>
            )}

            {/* Modal para Ver Estudiantes del Salón */}
            {showEstudiantesSalonModal && salonSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Estudiantes del Salón: {salonSeleccionado.nombre_salon}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowEstudiantesSalonModal(false);
                                    setSalonSeleccionado(null);
                                    setEstudiantesSalon([]);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                                <p><strong>Capacidad:</strong> {salonSeleccionado.estudiantes_matriculados || 0} / {salonSeleccionado.capacidad_maxima}</p>
                                {salonSeleccionado.grado && salonSeleccionado.seccion && (
                                    <p><strong>Grado y Sección:</strong> {salonSeleccionado.grado} {salonSeleccionado.seccion}</p>
                                )}
                            </div>
                            {estudiantesSalon.length > 0 ? (
                                <div className="estudiantes-list">
                                    {estudiantesSalon.map(estudiante => (
                                        <div key={estudiante.id_usuario} className="estudiante-item" style={{ 
                                            padding: '15px', 
                                            border: '1px solid #ddd', 
                                            borderRadius: '8px',
                                            marginBottom: '10px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0' }}>{estudiante.nombre} {estudiante.apellido}</h4>
                                                {estudiante.dni && <p style={{ margin: '0', color: '#666' }}>DNI: {estudiante.dni}</p>}
                                                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Correo: {estudiante.correo}</p>
                                            </div>
                                            <button 
                                                className="btn-primary"
                                                onClick={() => {
                                                    setNuevoMensaje({
                                                        destinatario: estudiante.id_usuario,
                                                        asunto: '',
                                                        contenido: '',
                                                        id_curso: null
                                                    });
                                                    setShowEstudiantesSalonModal(false);
                                                    setShowMensajeModal(true);
                                                }}
                                            >
                                                📧 Enviar Mensaje
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No hay estudiantes matriculados en este salón.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Crear Tarea */}
            {showCrearTarea && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Crear Nueva Tarea</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowCrearTarea(false);
                                    setNuevaTarea({ titulo: '', descripcion: '', fecha_limite: '', puntos_maximos: 100, id_curso: '' });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={crearTarea} className="modal-content">
                            <div className="form-group">
                                <label>Curso: *</label>
                                <select 
                                    value={nuevaTarea.id_curso}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, id_curso: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar curso</option>
                                    {cursos.filter(c => c.activo).map(curso => (
                                        <option key={curso.id_curso} value={curso.id_curso}>
                                            {curso.nombre_curso}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Título de la Tarea: *</label>
                                <input 
                                    type="text" 
                                    value={nuevaTarea.titulo}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                                    placeholder="Ej: Tarea de Matemáticas - Capítulo 3"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea 
                                    value={nuevaTarea.descripcion}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                                    placeholder="Descripción detallada de la tarea..."
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha Límite: *</label>
                                <input 
                                    type="date" 
                                    value={nuevaTarea.fecha_limite}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, fecha_limite: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Puntos Máximos:</label>
                                <input 
                                    type="number" 
                                    value={nuevaTarea.puntos_maximos}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, puntos_maximos: e.target.value})}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => {
                                        setShowCrearTarea(false);
                                        setNuevaTarea({ titulo: '', descripcion: '', fecha_limite: '', puntos_maximos: 100, id_curso: '' });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Crear Tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Ver Tareas y Calificaciones */}
            {tareas.length > 0 && (
                <div className="modal-overlay" style={{ display: showCalificaciones ? 'flex' : 'none' }}>
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Tareas y Entregas</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowCalificaciones(false);
                                    setTareas([]);
                                    setEntregas([]);
                                    setTareaSeleccionada(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ marginBottom: '20px' }}>
                                <h4>Tareas del Curso: {cursoSeleccionado?.nombre_curso}</h4>
                                <div className="tareas-list">
                                    {tareas.map(tarea => {
                                        const estadoInfo = getEstadoTarea(tarea.fecha_limite);
                                        return (
                                            <div key={tarea.id_tarea} className="tarea-item" style={{ 
                                                padding: '15px', 
                                                border: `2px solid ${estadoInfo.color}`, 
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                backgroundColor: estadoInfo.puedeEvaluar ? '#fff8e1' : '#fff'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                                        <h5 style={{ margin: '0 0 5px 0' }}>{tarea.titulo}</h5>
                                                        <span style={{ 
                                                            padding: '5px 10px', 
                                                            borderRadius: '4px', 
                                                            backgroundColor: estadoInfo.color,
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {estadoInfo.estado}
                                                        </span>
                                                    </div>
                                                    {tarea.descripcion && <p style={{ margin: '5px 0', color: '#666' }}>{tarea.descripcion}</p>}
                                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                                        Fecha límite: {new Date(tarea.fecha_limite).toLocaleDateString()}
                                                    </p>
                                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                                        Puntos máximos: {tarea.puntos_maximos}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                    {estadoInfo.puedeEvaluar ? (
                                                        <button 
                                                            className="btn-primary"
                                                            onClick={() => cargarEstudiantesParaEvaluar(tarea.id_tarea)}
                                                            style={{ backgroundColor: '#ff9800' }}
                                                        >
                                                            📝 Evaluar Estudiantes
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="btn-secondary"
                                                            onClick={() => cargarEntregas(tarea.id_tarea)}
                                                        >
                                                            Ver Entregas
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {entregas.length > 0 && (
                                <div>
                                    <h4>Entregas de la Tarea</h4>
                                    <div className="entregas-list">
                                        {entregas.map(entrega => (
                                            <div key={entrega.id_entrega} className="entrega-item" style={{ 
                                                padding: '15px', 
                                                border: '1px solid #ddd', 
                                                borderRadius: '8px',
                                                marginBottom: '10px'
                                            }}>
                                                <div style={{ marginBottom: '10px' }}>
                                                    <h5 style={{ margin: '0 0 5px 0' }}>
                                                        {entrega.estudiante_nombre} {entrega.estudiante_apellido}
                                                    </h5>
                                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                                        Fecha de entrega: {new Date(entrega.fecha_entrega).toLocaleDateString()}
                                                    </p>
                                                    {entrega.calificacion !== null && (
                                                        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                                                            Calificación: {entrega.calificacion} / 100
                                                        </p>
                                                    )}
                                                    {entrega.feedback_docente && (
                                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                                            Feedback: {entrega.feedback_docente}
                                                        </p>
                                                    )}
                                                </div>
                                                <button 
                                                    className="btn-primary"
                                                    onClick={() => {
                                                        setCalificacionEdit({
                                                            id_entrega: entrega.id_entrega,
                                                            calificacion: entrega.calificacion || '',
                                                            feedback: entrega.feedback_docente || ''
                                                        });
                                                    }}
                                                >
                                                    {entrega.calificacion ? 'Editar Calificación' : 'Calificar'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {calificacionEdit.id_entrega && (
                                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <h4>Calificar Entrega</h4>
                                    <form onSubmit={actualizarCalificacion}>
                                        <div className="form-group">
                                            <label>Calificación (0-100): *</label>
                                            <input 
                                                type="number" 
                                                value={calificacionEdit.calificacion}
                                                onChange={(e) => setCalificacionEdit({...calificacionEdit, calificacion: e.target.value})}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Feedback del Docente:</label>
                                            <textarea 
                                                value={calificacionEdit.feedback}
                                                onChange={(e) => setCalificacionEdit({...calificacionEdit, feedback: e.target.value})}
                                                placeholder="Comentarios sobre la entrega..."
                                                rows="3"
                                            />
                                        </div>
                                        <div className="modal-actions">
                                            <button 
                                                type="button" 
                                                className="btn-secondary"
                                                onClick={() => setCalificacionEdit({ id_entrega: null, calificacion: '', feedback: '' })}
                                            >
                                                Cancelar
                                            </button>
                                            <button type="submit" className="btn-primary">
                                                Guardar Calificación
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Ver y Gestionar Horarios del Curso */}
            {showHorariosCurso && cursoSeleccionadoHorarios && (
                <div className="modal-overlay">
                    <div className="modal large" style={{ maxWidth: '1200px' }}>
                        <div className="modal-header">
                            <h3>Horarios - {cursoSeleccionadoHorarios.nombre_curso}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowHorariosCurso(false);
                                    setCursoSeleccionadoHorarios(null);
                                    setHorariosCurso([]);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            {/* Botón para agregar horario */}
                            <div style={{ marginBottom: '20px' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setNuevoHorario({
                                            id_curso: cursoSeleccionadoHorarios.id_curso,
                                            id_docente: user.id.toString(),
                                            id_salon: '',
                                            dia_semana: '',
                                            hora_inicio: '',
                                            hora_fin: '',
                                            turno: ''
                                        });
                                        setShowAgregarHorario(true);
                                    }}
                                >
                                    + Agregar Horario
                                </button>
                            </div>

                            {/* Tabla de Horarios */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Día</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Hora Inicio</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Hora Fin</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Salón</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Turno</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {horariosCurso.map(horario => (
                                            <tr key={horario.id_horario}>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{horario.dia_semana}</td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{horario.hora_inicio}</td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{horario.hora_fin}</td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {horario.nombre_salon || 'Sin asignar'}
                                                    {horario.grado && horario.seccion && ` (${horario.grado} ${horario.seccion})`}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {horario.turno || '-'}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                        <button
                                                            className="btn-secondary"
                                                            style={{ padding: '5px 10px', fontSize: '12px' }}
                                                            onClick={() => {
                                                                setHorarioEditando({
                                                                    ...horario,
                                                                    id_salon: horario.id_salon ? horario.id_salon.toString() : ''
                                                                });
                                                                setShowEditarHorario(true);
                                                            }}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="btn-danger"
                                                            style={{ padding: '5px 10px', fontSize: '12px' }}
                                                            onClick={() => eliminarHorario(horario.id_horario, cursoSeleccionadoHorarios.id_curso)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {horariosCurso.length === 0 && (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                                    No hay horarios asignados para este curso
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Agregar Horario */}
            {showAgregarHorario && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Agregar Horario</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowAgregarHorario(false);
                                    setNuevoHorario({
                                        id_curso: null,
                                        id_docente: '',
                                        id_salon: '',
                                        dia_semana: '',
                                        hora_inicio: '',
                                        hora_fin: '',
                                        turno: ''
                                    });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={crearHorario} className="modal-content">
                            <div className="form-group">
                                <label>Día de la Semana: *</label>
                                <select
                                    value={nuevoHorario.dia_semana}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, dia_semana: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar día</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hora Inicio: *</label>
                                <input
                                    type="time"
                                    value={nuevoHorario.hora_inicio}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, hora_inicio: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Hora Fin: *</label>
                                <input
                                    type="time"
                                    value={nuevoHorario.hora_fin}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, hora_fin: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select
                                    value={nuevoHorario.turno}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, turno: e.target.value})}
                                >
                                    <option value="">Seleccionar turno (opcional)</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salón (opcional):</label>
                                <select
                                    value={nuevoHorario.id_salon}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, id_salon: e.target.value})}
                                >
                                    <option value="">Seleccionar salón (opcional)</option>
                                    {todosSalones.filter(s => s.activo).map(salon => (
                                        <option key={salon.id_salon} value={salon.id_salon}>
                                            {salon.nombre_salon} {salon.grado && salon.seccion ? `(${salon.grado} ${salon.seccion})` : ''} {salon.turno ? `- ${salon.turno}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowAgregarHorario(false);
                                        setNuevoHorario({
                                            id_curso: null,
                                            id_docente: '',
                                            id_salon: '',
                                            dia_semana: '',
                                            hora_inicio: '',
                                            hora_fin: '',
                                            turno: ''
                                        });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Crear Horario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Editar Horario */}
            {showEditarHorario && horarioEditando && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Editar Horario</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowEditarHorario(false);
                                    setHorarioEditando(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={actualizarHorario} className="modal-content">
                            <div className="form-group">
                                <label>Día de la Semana: *</label>
                                <select
                                    value={horarioEditando.dia_semana}
                                    onChange={(e) => setHorarioEditando({...horarioEditando, dia_semana: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar día</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hora Inicio: *</label>
                                <input
                                    type="time"
                                    value={horarioEditando.hora_inicio}
                                    onChange={(e) => setHorarioEditando({...horarioEditando, hora_inicio: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Hora Fin: *</label>
                                <input
                                    type="time"
                                    value={horarioEditando.hora_fin}
                                    onChange={(e) => setHorarioEditando({...horarioEditando, hora_fin: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select
                                    value={horarioEditando.turno || ''}
                                    onChange={(e) => setHorarioEditando({...horarioEditando, turno: e.target.value})}
                                >
                                    <option value="">Seleccionar turno (opcional)</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salón (opcional):</label>
                                <select
                                    value={horarioEditando.id_salon || ''}
                                    onChange={(e) => setHorarioEditando({...horarioEditando, id_salon: e.target.value})}
                                >
                                    <option value="">Seleccionar salón (opcional)</option>
                                    {todosSalones.filter(s => s.activo).map(salon => (
                                        <option key={salon.id_salon} value={salon.id_salon}>
                                            {salon.nombre_salon} {salon.grado && salon.seccion ? `(${salon.grado} ${salon.seccion})` : ''} {salon.turno ? `- ${salon.turno}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowEditarHorario(false);
                                        setHorarioEditando(null);
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Actualizar Horario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Asignarse a Cursos Disponibles */}
            {showCursosDisponibles && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Cursos Disponibles</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowCursosDisponibles(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <p style={{ marginBottom: '20px', color: '#666' }}>
                                Selecciona un curso para asignarte como docente. Podrás gestionar horarios y tareas una vez asignado.
                            </p>
                            <div className="courses-grid">
                                {cursosDisponibles.filter(curso => {
                                    // Filtrar cursos a los que ya está asignado
                                    return !cursos.find(c => c.id_curso === curso.id_curso) && curso.activo;
                                }).length > 0 ? (
                                    cursosDisponibles
                                        .filter(curso => {
                                            // Filtrar cursos a los que ya está asignado
                                            return !cursos.find(c => c.id_curso === curso.id_curso) && curso.activo;
                                        })
                                        .map(curso => (
                                            <div key={curso.id_curso} className="course-card" style={{ 
                                                padding: '15px', 
                                                border: '1px solid #ddd', 
                                                borderRadius: '8px',
                                                marginBottom: '15px'
                                            }}>
                                                <div className="course-header">
                                                    <h3 className="course-title">{curso.nombre_curso}</h3>
                                                    <span className="course-status active">Disponible</span>
                                                </div>
                                                <div className="course-info">
                                                    <p className="course-description">{curso.descripcion || 'Sin descripción'}</p>
                                                    {curso.turno && (
                                                        <p style={{ color: '#007bff', fontWeight: 'bold', margin: '5px 0' }}>
                                                            Turno: {curso.turno}
                                                        </p>
                                                    )}
                                                    <div className="course-stats">
                                                        <div className="stat">
                                                            <span className="stat-label">Docentes:</span>
                                                            <span className="stat-value">{curso.total_docentes || 0}</span>
                                                        </div>
                                                        <div className="stat">
                                                            <span className="stat-label">Estudiantes:</span>
                                                            <span className="stat-value">{Math.floor(Number(curso.total_estudiantes) || 0)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="course-actions" style={{ marginTop: '15px' }}>
                                                    <button 
                                                        className="btn-primary"
                                                        onClick={() => asignarseACurso(curso.id_curso)}
                                                    >
                                                        ➕ Asignarme a este Curso
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="no-data">
                                        <p>No hay cursos disponibles para asignarse. Ya estás asignado a todos los cursos activos.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Evaluar Tarea */}
            {showEvaluacionTarea && tareaEvaluacion && (
                <div className="modal-overlay">
                    <div className="modal large" style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h3>Evaluar Tarea: {tareaEvaluacion.titulo}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowEvaluacionTarea(false);
                                    setTareaEvaluacion(null);
                                    setEstudiantesConEntregas([]);
                                    setCalificacionesEditando({});
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                                <p><strong>Curso:</strong> {tareaEvaluacion.nombre_curso}</p>
                                <p><strong>Fecha límite:</strong> {new Date(tareaEvaluacion.fecha_limite).toLocaleDateString()}</p>
                                <p><strong>Puntos máximos:</strong> {tareaEvaluacion.puntos_maximos}</p>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <h4>Estudiantes ({estudiantesConEntregas.length})</h4>
                            </div>

                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {estudiantesConEntregas.map(estudiante => {
                                    const califData = calificacionesEditando[estudiante.id_usuario] || { calificacion: '', feedback: '' };
                                    return (
                                        <div key={estudiante.id_usuario} style={{ 
                                            padding: '15px', 
                                            border: '1px solid #ddd', 
                                            borderRadius: '8px',
                                            marginBottom: '15px',
                                            backgroundColor: estudiante.id_entrega ? '#f0f9ff' : '#fff5f5'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h5 style={{ margin: '0 0 5px 0' }}>
                                                        {estudiante.nombre} {estudiante.apellido}
                                                    </h5>
                                                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                                        {estudiante.correo}
                                                    </p>
                                                    {estudiante.dni && (
                                                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                                            DNI: {estudiante.dni}
                                                        </p>
                                                    )}
                                                    <div style={{ marginTop: '10px' }}>
                                                        <span style={{ 
                                                            padding: '4px 8px', 
                                                            borderRadius: '4px', 
                                                            backgroundColor: estudiante.id_entrega ? '#28a745' : '#dc3545',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {estudiante.estado}
                                                        </span>
                                                        {estudiante.fecha_entrega && (
                                                            <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>
                                                                Entregado: {new Date(estudiante.fecha_entrega).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginTop: '15px' }}>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                                        Calificación (0-20): *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        step="0.01"
                                                        value={califData.calificacion}
                                                        onChange={(e) => {
                                                            setCalificacionesEditando({
                                                                ...calificacionesEditando,
                                                                [estudiante.id_usuario]: {
                                                                    ...califData,
                                                                    calificacion: e.target.value
                                                                }
                                                            });
                                                        }}
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '8px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px' 
                                                        }}
                                                        placeholder="0-20"
                                                    />
                                                    {estudiante.calificacion !== null && estudiante.calificacion !== undefined && (
                                                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                                                            Calificación actual: {estudiante.calificacion}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                                        Feedback (opcional):
                                                    </label>
                                                    <textarea
                                                        value={califData.feedback}
                                                        onChange={(e) => {
                                                            setCalificacionesEditando({
                                                                ...calificacionesEditando,
                                                                [estudiante.id_usuario]: {
                                                                    ...califData,
                                                                    feedback: e.target.value
                                                                }
                                                            });
                                                        }}
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '8px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            minHeight: '60px'
                                                        }}
                                                        placeholder="Comentarios sobre la entrega..."
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => guardarCalificacion(estudiante.id_usuario, tareaEvaluacion.id_tarea)}
                                                    style={{ padding: '8px 20px' }}
                                                >
                                                    💾 Guardar Calificación
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardDocente;